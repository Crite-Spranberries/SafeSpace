import { router, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
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
import React, { useRef, useState, useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendMessage } from '@/lib/ibmWatson';
import { Button } from '@/components/ui/Button';
import { addReport, StoredReport } from '@/lib/reports';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';
import { ReportData, createReportDataFromDate, mergeReportData } from '@/lib/reportData';

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
  const lastSpokenMessageId = useRef<string | null>(null); // Track which message was last spoken
  const isMountedRef = useRef(true); // Track if component is mounted/focused
  const [userLocation, setUserLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);

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

  // Get user's current location on mount
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;

          // Reverse geocode to get address
          let locationName = '';
          try {
            const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
            locationName = (geo as any).name
              ? `${(geo as any).name}, ${(geo as any).city}, ${(geo as any).region}`
              : (geo as any).city
                ? `${(geo as any).city}, ${(geo as any).region}`
                : '';
          } catch (geoErr) {
            console.warn('Failed to reverse geocode location', geoErr);
          }

          const userLoc = {
            name: locationName || 'Current Location',
            coords: [latitude, longitude] as [number, number],
          };
          setUserLocation(userLoc);
        }
      } catch (err) {
        console.warn('Failed to get current location', err);
      }
    };

    getCurrentLocation();
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
      // Build conversation history for Watson INCLUDING the just-added user message
      // Limit to recent messages to avoid context pollution
      const recent = [...messages, newMessage].slice(-6);
      const conversationHistory = recent.map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      const botResponse = await sendMessage(userMessageText, conversationHistory);

      // Use ONLY the latest AI turn's data (no accumulation)
      const d = botResponse.fullData || null;
      const newAiData = d
        ? {
            report_title: typeof d.report_title === 'string' ? d.report_title : '',
            report_type: Array.isArray(d.report_type) ? d.report_type : [],
            trades_field: Array.isArray(d.trades_field) ? d.trades_field : [],
            report_description:
              typeof d.report_description === 'string' ? d.report_description : '',
            parties_involved: Array.isArray(d.parties_involved) ? d.parties_involved : [],
            witnesses: Array.isArray(d.witnesses) ? d.witnesses : [],
          }
        : {
            report_title: '',
            report_type: [],
            trades_field: [],
            report_description: '',
            parties_involved: [],
            witnesses: [],
          };

      // Sanitize next question to avoid meta/rephrase prompts
      const sanitizeNextQuestion = (data: any, q: string): string => {
        const lower = q.toLowerCase();
        const isMeta = /rephrase|processing|\bformat\b|policy|policies|procedures/.test(lower);
        // Determine next missing field
        const needsDescription = !(
          data.report_description && data.report_description.trim().length > 20
        );
        const needsParties = !(
          Array.isArray(data.parties_involved) && data.parties_involved.length > 0
        );
        const needsType = !(Array.isArray(data.report_type) && data.report_type.length > 0);
        const needsTrade = !(Array.isArray(data.trades_field) && data.trades_field.length > 0);
        if (isMeta) {
          if (needsDescription) return 'Please describe the incident.';
          if (needsParties) return 'Who was involved in the incident?';
          if (needsType) return 'What type of incident was this (e.g., Harassment, Bullying)?';
          if (needsTrade) return 'Which trade or field was involved (e.g., Electrical, Plumbing)?';
        }
        // If multiple questions, keep the first interrogative sentence only
        const firstQ = q.match(/[^.?!]*\?+/);
        return firstQ ? firstQ[0].trim() : q.trim();
      };

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: sanitizeNextQuestion(newAiData, botResponse.displayText || ''),
        sender: 'safi',
        timestamp: new Date(),
      };

      setAiData(newAiData);
      setMessages((prev) => [...prev, botMessage]);

      // Check if conversation is complete (exact phrase from system prompt)
      const completionPhrase = "that's all the information i need";
      console.log(botResponse.fullData);
      if (botResponse.displayText.toLowerCase().includes(completionPhrase)) {
        if (botResponse.fullData && !creatingReport && !createdReport) {
          try {
            setCreatingReport(true);
            const data = newAiData; // use only the latest AI data
            const createdAt = new Date();
            const description: string = data.report_description || '';
            const tags: string[] = [
              ...(Array.isArray(data.report_type) ? data.report_type : []),
              ...(Array.isArray(data.trades_field) ? data.trades_field : []),
            ];
            const title =
              data.report_title || (tags.length > 0 ? `Report: ${tags[0]}` : 'Incident Report');

            // Create proper ReportData structure
            const baseReportData = createReportDataFromDate(createdAt);
            const reportData: ReportData = mergeReportData(
              {
                report_method: 'ai_chat',
                report_title: title,
                location_name: userLocation?.name || 'Current Location',
                location_coords: userLocation?.coords || [0, 0],
                report_type: Array.isArray(data.report_type) ? data.report_type : [],
                trades_field: Array.isArray(data.trades_field) ? data.trades_field : [],
                report_desc: description,
                report_transcript: description,
                primaries_involved: Array.isArray(data.parties_involved)
                  ? data.parties_involved
                  : [],
                witnesses: Array.isArray(data.witnesses) ? data.witnesses : [],
                actions_taken: [],
                recommended_actions: [],
                isPublic: false,
              },
              mergeReportData(baseReportData)
            );

            // Create StoredReport for backward compatibility
            const report: StoredReport = {
              id: `${createdAt.getTime()}_report`,
              title,
              date: formatDate(createdAt),
              timestamp: formatTime(createdAt),
              status: 'Private',
              tags,
              report_type: reportData.report_type,
              trades_field: reportData.trades_field,
              primaries_involved: Array.isArray(data.parties_involved)
                ? data.parties_involved.join(', ')
                : '',
              witnesses: Array.isArray(data.witnesses) ? data.witnesses.join(', ') : '',
              actions_taken: '',
              excerpt: description.substring(0, 120) + (description.length > 120 ? '...' : ''),
              content: description,
              location: reportData.location_name,
              reportData: reportData, // Store the structured data
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
      let errorMessage = 'Unknown error occurred';
      if (err instanceof Error) {
        errorMessage = err.message;
        // Check if it's a JSON parse error
        if (err.message.includes('JSON') || err.message.includes('parse')) {
          errorMessage = 'Sorry, I had trouble understanding the response. Please try again.';
        }
      }
      setError(errorMessage);
      console.error('Error sending message:', err);

      // Add a user-friendly error message to the chat
      const errorMessageObj: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm sorry, I encountered an error. Could you please try rephrasing your message?",
        sender: 'safi',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessageObj]);
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

  // Track if page is focused to prevent TTS on other pages
  useFocusEffect(
    React.useCallback(() => {
      // Page is focused - allow TTS
      isMountedRef.current = true;

      return () => {
        // Page is unfocused - stop all speech immediately
        isMountedRef.current = false;
        Speech.stop();
      };
    }, [])
  );

  useEffect(() => {
    // Only speak if component is mounted, page is focused, auto is enabled, and we have messages
    if (isMountedRef.current && messages.length > 0 && isAuto) {
      const lastMessage = messages[messages.length - 1];
      // Only speak if this is a new Safi message that hasn't been spoken yet
      if (lastMessage.sender === 'safi' && lastMessage.id !== lastSpokenMessageId.current) {
        // Stop any ongoing speech before starting new speech
        Speech.stop();
        // Only speak if component is still mounted and focused
        if (isMountedRef.current) {
          Speech.speak(lastMessage.text);
          lastSpokenMessageId.current = lastMessage.id;
        }
      }
    }
  }, [messages, isAuto]);

  // Clean up speech when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  // Stop speech when auto is disabled
  useEffect(() => {
    if (!isAuto) {
      Speech.stop();
    }
  }, [isAuto]);

  function textSpeech(text: string) {
    // Stop any ongoing speech before starting new speech
    Speech.stop();
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
                    if (createdReport && createdReport.reportData) {
                      // Pass reportData as JSON, similar to form.tsx
                      router.push({
                        pathname: '/create_report/report',
                        params: {
                          reportData: JSON.stringify(createdReport.reportData),
                          // Keep legacy params for backward compatibility
                          reportTitle: createdReport.title,
                          location:
                            createdReport.location ||
                            createdReport.reportData.location_name ||
                            'No location provided',
                          date: createdReport.date,
                          time: createdReport.timestamp,
                          reportType: createdReport.report_type
                            ? JSON.stringify(createdReport.report_type)
                            : JSON.stringify([]),
                          tradesField: createdReport.trades_field
                            ? JSON.stringify(createdReport.trades_field)
                            : JSON.stringify([]),
                          description:
                            createdReport.content ||
                            createdReport.reportData.report_desc ||
                            'No description provided',
                          witnesses:
                            createdReport.reportData.witnesses &&
                            Array.isArray(createdReport.reportData.witnesses)
                              ? createdReport.reportData.witnesses.join(', ')
                              : 'No witnesses provided.',
                          individualsInvolved:
                            createdReport.reportData.primaries_involved &&
                            Array.isArray(createdReport.reportData.primaries_involved)
                              ? createdReport.reportData.primaries_involved.join(', ')
                              : 'No individuals involved provided.',
                          actionsTaken: 'No actions taken provided.',
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
