import { router, Stack } from 'expo-router';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  ScrollView,
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
  const navigation = useNavigation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
          <Image
            source={require('../../assets/images/Safi.png')}
            style={keyboardVisible ? styles.imageSmall : styles.image}
            resizeMode="contain"
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
                {/* <ChatBubble
                  type="safi"
                  text="Hello, I'm Safi! You can talk to me directly, or let my questions guide you."
                />
                <ChatBubble
                  type="user"
                  text="Just had an uncomfortable encounter with a male coworker. He kept making weirdly sexual jokes and comments at me."
                />
                <ChatBubble type="safi" text="Did this happen at your current location?" /> */}
                {chat.map((message, index) => (
                  <ChatBubble key={index} type={message.type} text={message.text} />
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
    width: '100%',
  },
  imageSmall: {
    height: '35%',
    alignSelf: 'center',
  },
  chatContainer: {
    gap: 16,
    marginBottom: 16,
  },
});
