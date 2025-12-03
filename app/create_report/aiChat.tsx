import { router, Stack } from 'expo-router';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, Volume2, VolumeOff } from 'lucide-react-native';
import ChatBubble from '@/components/ui/ChatBubble';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import ChatTyping from '@/components/ui/ChatTyping';
import * as Haptics from 'expo-haptics';
import { useRef, useState, useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessage } from '@/lib/ibmWatson';
import { Button } from '@/components/ui/Button';
import { addReport, StoredReport } from '@/lib/reports';
import * as Speech from 'expo-speech';

const SCREEN_OPTIONS = {
  title: '',
  headerBackTitle: 'Back',
  headerTransparent: true,
  headerLeft: () => (
    <TouchableOpacity
      style={styles.backButton}
      onPress={async () => {
        router.back();
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}>
      <Icon as={ArrowLeft} size={24} />
    </TouchableOpacity>
  ),
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'safi';
  timestamp: Date;
};

export default function aiChat() {
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const videoWidth = useRef(new Animated.Value(80)).current;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-greeting',
      text: "Hi, I'm Safi. Could you tell me what happened?",
      sender: 'safi',
      timestamp: new Date(),
    },
  ]);
  const [aiData, setAiData] = useState<any>({
    report_title: '',
    report_type: [],
    trades_field: [],
    report_description: '',
    parties_involved: [],
    witnesses: [],
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [creatingReport, setCreatingReport] = useState(false);
  const [createdReport, setCreatedReport] = useState<StoredReport | null>(null);
  const [isAuto, setIsAuto] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);

  const formatDate = (value: Date) =>
    value.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  const formatTime = (value: Date) =>
    value.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

  const videoSource = require('../../assets/video/ai-safi-blob.mov');

  // Preload the video asset
  useEffect(() => {
    const preloadAsset = async () => {
      try {
        const asset = Asset.fromModule(videoSource);
        await asset.downloadAsync();
        setVideoLoaded(true);
      } catch (error) {
        console.warn('Failed to preload video asset:', error);
        setVideoLoaded(true); // Continue anyway
      }
    };
    preloadAsset();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const player = useVideoPlayer(videoLoaded ? videoSource : null, (player) => {
    player.loop = true;
    player.muted = true;
    player.playbackRate = 1;

    // Add status listener to know when video is ready
    player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setPlayerReady(true);
        player.play();
      }
    });
  });

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessageText = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setError(null);
    setIsLoading(true);

    try {
      // Build conversation history - use recent messages only, don't duplicate the new user message
      const recent = [...messages].slice(-8);
      const conversationHistory = recent.map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      // Inject current accumulated data as context to prevent forgetting
      const contextSummary = {
        role: 'assistant' as const,
        content: `Previously collected: ${JSON.stringify(aiData)}`,
      };

      const botResponse = await sendMessage(userMessageText, [
        ...conversationHistory,
        contextSummary,
      ]);

      // MERGE new data with existing to prevent losing information
      const d = botResponse.fullData || null;

      // Helper to merge arrays without duplicates
      const mergeUnique = (arr1: string[], arr2: string[]) => {
        const combined = [...(arr1 || []), ...(arr2 || [])];
        return [...new Set(combined.map((s) => s.trim().toLowerCase()))]
          .map((key) => combined.find((s) => s.trim().toLowerCase() === key)!)
          .filter(Boolean);
      };

      // Helper to merge descriptions
      const mergeDesc = (prev: string, next: string) => {
        const p = (prev || '').trim();
        const n = (next || '').trim();
        if (!n) return p;
        if (!p) return n;
        if (p.toLowerCase().includes(n.toLowerCase())) return p;
        if (n.toLowerCase().includes(p.toLowerCase())) return n;
        return `${p} ${n}`.trim();
      };

      const newAiData = {
        report_title: (d?.report_title || aiData.report_title || '').trim(),
        report_type: mergeUnique(aiData.report_type, d?.report_type || []),
        trades_field: mergeUnique(aiData.trades_field, d?.trades_field || []),
        report_description: mergeDesc(aiData.report_description, d?.report_description || ''),
        parties_involved: mergeUnique(aiData.parties_involved, d?.parties_involved || []),
        witnesses: mergeUnique(aiData.witnesses, d?.witnesses || []),
      };

      // Control question flow: 2-3 questions, then complete
      const sanitizeNextQuestion = (data: any, q: string): string => {
        const lower = q.toLowerCase();
        const isMeta = /rephrase|processing|\bformat\b|policy|policies|procedures/.test(lower);

        const hasDescription =
          data.report_description && data.report_description.trim().length > 20;
        const hasParties =
          Array.isArray(data.parties_involved) &&
          data.parties_involved.filter(
            (p: string) =>
              !/^(user|me|myself|reporter|electrical apprentice|apprentice)$/i.test(p.trim())
          ).length > 0;
        const hasType = Array.isArray(data.report_type) && data.report_type.length > 0;

        const completionPhrase = "That's all the information I need, thank you for sharing.";

        // Complete after 2-3 questions if we have key info
        if (questionCount >= 2 && hasDescription && (hasParties || hasType)) {
          return completionPhrase;
        }

        // Cap at 3 questions
        if (questionCount >= 3) {
          return completionPhrase;
        }

        // Pick next needed question - override if meta or already asked
        const askDescription = 'Could you describe what happened?';
        const askParties = 'Who else was involved? Please provide their name.';
        const askWitnesses = 'Were there any witnesses?';

        if (isMeta) {
          if (!hasDescription) return askDescription;
          if (!hasParties && questionCount < 2) return askParties;
          if (questionCount < 2) return askWitnesses;
          return completionPhrase;
        }

        // Use AI's question if it's good, otherwise pick best next question
        const firstQ = q.match(/[^.?!]*\?+/);
        const aiQuestion = firstQ ? firstQ[0].trim() : '';

        // If AI's question is about something we already have, override it
        const qLower = aiQuestion.toLowerCase();
        const asksAboutParties =
          qLower.includes('who') || qLower.includes('name') || qLower.includes('involved');
        const asksAboutDescription =
          qLower.includes('describe') || qLower.includes('what happened');

        if (asksAboutParties && hasParties) {
          if (!hasDescription) return askDescription;
          return askWitnesses;
        }

        if (asksAboutDescription && hasDescription) {
          if (!hasParties) return askParties;
          return askWitnesses;
        }

        // Otherwise use the AI's question
        return aiQuestion || askDescription;
      };

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: sanitizeNextQuestion(newAiData, botResponse.displayText || ''),
        sender: 'safi',
        timestamp: new Date(),
      };

      setAiData(newAiData);
      setMessages((prev) => [...prev, botMessage]);

      // Track question count
      if (botMessage.text.includes('?') && !botMessage.text.toLowerCase().includes("that's all")) {
        setQuestionCount((prev) => prev + 1);
      }

      // Check if conversation is complete (exact phrase from system prompt)
      const completionPhrase = "that's all the information i need";
      console.log('Current data:', newAiData);
      console.log('Questions asked:', questionCount);
      if (botMessage.text.toLowerCase().includes(completionPhrase)) {
        if (newAiData && !creatingReport && !createdReport) {
          try {
            setCreatingReport(true);
            const data = newAiData; // use merged AI data
            const createdAt = new Date();
            const description: string = data.report_description || '';
            const tags: string[] = [
              ...(Array.isArray(data.report_type) ? data.report_type : []),
              ...(Array.isArray(data.trades_field) ? data.trades_field : []),
            ];
            const title =
              data.report_title || (tags.length > 0 ? `Report: ${tags[0]}` : 'Incident Report');
            const report: StoredReport = {
              id: `${createdAt.getTime()}_report`,
              title,
              date: formatDate(createdAt),
              timestamp: formatTime(createdAt),
              status: 'Private',
              tags,
              report_type: Array.isArray(data.report_type) ? data.report_type : [],
              trades_field: Array.isArray(data.trades_field) ? data.trades_field : [],
              excerpt: description.substring(0, 120) + (description.length > 120 ? '...' : ''),
              content: description,
            };
            await addReport(report);
            await AsyncStorage.setItem('reportData', JSON.stringify(data)); // retain raw data if needed
            setCreatedReport(report);
          } catch (e) {
            console.warn('Auto report creation failed', e);
          } finally {
            setCreatingReport(false);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
      Animated.timing(videoWidth, {
        toValue: 40,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
      Animated.timing(videoWidth, {
        toValue: 80,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0 && isAuto) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'safi') {
        Speech.speak(lastMessage.text);
      }
    }
  }, [messages]);

  function textSpeech(text: string) {
    Speech.speak(text);
  }

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen
        options={{
          ...SCREEN_OPTIONS,
          headerRight: () => (
            <Button
              variant="purple"
              radius="full"
              size="icon"
              onPress={() => setIsAuto(!isAuto)}
              style={{ marginRight: 16 }}>
              <Icon as={isAuto ? Volume2 : VolumeOff} size={20} color="white" />
            </Button>
          ),
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AppText weight="bold" style={styles.heading}>
          Chat with Safi
        </AppText>
        <KeyboardAvoidingView
          style={styles.contentWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -25 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={{
                width: videoWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                aspectRatio: 1,
                alignSelf: 'center',
              }}>
              {!playerReady && (
                <View style={{ width: '100%', height: '100%' }}>
                  <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
                </View>
              )}
              <VideoView
                style={[{ width: '100%', height: '100%' }, !playerReady && styles.hidden]}
                player={player}
                allowsPictureInPicture={false}
                nativeControls={false}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
          <View style={{ flex: 1, position: 'relative' }}>
            <Animated.ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              style={styles.scrollView}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: true,
              })}
              scrollEventThrottle={16}
              onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}>
              <View style={styles.chatContainer}>
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    type={message.sender}
                    text={message.text}
                    style={message.sender === 'safi' ? styles.safiBubble : styles.userBubble}
                    isAuto={isAuto}
                    onPress={() => textSpeech(message.text)}
                  />
                ))}

                {isLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                    <AppText style={styles.loadingText}>Thinking...</AppText>
                  </View>
                )}
                {error && (
                  <View style={styles.errorContainer}>
                    <AppText style={styles.errorText}>⚠️ {error}</AppText>
                  </View>
                )}
              </View>
            </Animated.ScrollView>
            <LinearGradient
              colors={['#000', 'transparent']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 30,
                pointerEvents: 'none',
              }}
            />
          </View>

          {creatingReport ||
            (createdReport ? (
              <View style={styles.submitButtonContainer}>
                <Button
                  variant="purple"
                  radius="full"
                  size="lg"
                  style={styles.submitButton}
                  disabled={creatingReport || !createdReport}
                  onPress={() => {
                    if (createdReport) {
                      router.push({
                        pathname: '/create_report/report',
                        params: {
                          location: createdReport.location || 'No location provided',
                          date: createdReport.date,
                          time: createdReport.timestamp,
                          reportType: createdReport.report_type
                            ? JSON.stringify(createdReport.report_type)
                            : JSON.stringify([]),
                          tradesField: createdReport.trades_field
                            ? JSON.stringify(createdReport.trades_field)
                            : JSON.stringify([]),
                          description: createdReport.content || 'No description provided',
                          witnesses:
                            aiData.witnesses && Array.isArray(aiData.witnesses)
                              ? aiData.witnesses.join(', ')
                              : 'No witnesses provided.',
                          individualsInvolved:
                            aiData.parties_involved && Array.isArray(aiData.parties_involved)
                              ? aiData.parties_involved.join(', ')
                              : 'No individuals involved provided.',
                          actionsTaken: 'No actions taken provided.',
                          reportTitle: createdReport.title,
                        },
                      });
                    }
                  }}>
                  <AppText weight="medium" style={{ color: 'white' }}>
                    {creatingReport
                      ? 'Creating Report...'
                      : createdReport
                        ? 'Submit Report'
                        : 'Waiting for AI...'}
                  </AppText>
                </Button>
              </View>
            ) : (
              <ChatTyping
                inputText={inputText}
                setInputText={setInputText}
                handleSend={handleSend}
                isLoading={isLoading}
              />
            ))}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollView: {
    padding: 16,
  },
  heading: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  image: {
    width: '80%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  imageSmall: {
    width: '40%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
    position: 'absolute',
  },
  chatContainer: {
    gap: 16,
    marginBottom: 16,
  },
  safiBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#999',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  submitButtonContainer: {
    marginBottom: 30,
    marginHorizontal: 16,
  },
  submitButton: {
    alignSelf: 'center',
    marginHorizontal: 16,
    width: '100%',
  },
});
