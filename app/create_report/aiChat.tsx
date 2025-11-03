import { router, Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import ChatBubble from '@/components/ui/chatBubble';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import ChatTyping from '@/components/ui/chatTyping';

const SCREEN_OPTIONS = {
  title: '',
  headerBackTitle: 'Back',
  headerTransparent: true,
  headerLeft: () => (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Icon as={ArrowLeft} size={24} />
    </TouchableOpacity>
  ),
};

export default function aiChat() {
  const navigation = useNavigation();
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
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Image source={require('../../assets/images/Safi.png')} style={styles.image} />
            <View style={styles.chatContainer}>
              <ChatBubble
                type="safi"
                text="Hello, I'm Safi! You can talk to me directly, or let my questions guide you."
              />
              <ChatBubble type="user" text="Description of what happened blah blah blah" />
              <ChatBubble
                type="user"
                text="Select one of the following"
                withButtons={['Option 1', 'Option 2', 'Option 3', 'Option 4']}
              />
            </View>
          </ScrollView>
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
  heading: {
    color: 'white',
    fontSize: 24,
    textAlign: 'center',
  },
  image: {
    width: '100%',
  },
  chatContainer: {
    gap: 16,
  },
});
