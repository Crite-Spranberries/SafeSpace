import { router, Stack } from 'expo-router';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import ChatBubble from '@/components/ui/ChatBubble';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import ChatTyping from '@/components/ui/ChatTyping';
import * as Haptics from 'expo-haptics';
import { useRef, useState, useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';
import { ActivityIndicator } from 'react-native';

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

export default function aiChat() {
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

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

  const [chat, setChat] = useState<Array<{ type: 'safi' | 'user'; text: string }>>([
    {
      type: 'safi',
      text: "Hello, I'm Safi! You can talk to me directly, or let my questions guide you.",
    },
    {
      type: 'user',
      text: 'Just had an uncomfortable encounter with a male coworker. He kept making weirdly sexual jokes and comments at me.',
    },
    { type: 'safi', text: 'Did this happen at your current location?' },
  ]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AppText weight="bold" style={styles.heading}>
          Chat with Safi
        </AppText>

        <KeyboardAvoidingView
          style={styles.contentWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -25 : 0}>
          {!playerReady && (
            <View style={keyboardVisible ? styles.imageSmall : styles.image}>
              <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
            </View>
          )}
          <VideoView
            style={[
              keyboardVisible ? styles.imageSmall : styles.image,
              !playerReady && styles.hidden,
            ]}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
          />
          <View style={{ flex: 1, position: 'relative' }}>
            <Animated.ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              style={styles.scrollView}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
                useNativeDriver: true,
              })}
              scrollEventThrottle={16}
              onLayout={(e) => setScrollViewHeight(e.nativeEvent.layout.height)}>
              <View style={styles.chatContainer}>
                {chat.map((message, index) => (
                  <ChatBubble
                    key={index}
                    type={message.type}
                    text={message.text}
                    style={message.type === 'safi' ? styles.safiBubble : styles.userBubble}
                  />
                ))}
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
          <ChatTyping />
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
});
