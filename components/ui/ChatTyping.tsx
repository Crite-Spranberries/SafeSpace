import { View } from 'react-native';
import { Input } from './Input';
import { StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Mic } from 'lucide-react-native';
import { Button } from './Button';
import { AppText } from './AppText';

export default function ChatTyping({
  inputText,
  setInputText,
  handleSend,
  isLoading,
}: {
  inputText: string;
  setInputText: (text: string) => void;
  handleSend: () => void;
  isLoading: boolean;
}) {
  return (
    <View style={styles.container}>
      {/* <Button size="icon" variant="ghost" radius="full" style={styles.button}>
        <Icon as={Mic} size={24} color="#5E349E" />
      </Button> */}
      <Input
        placeholder="Type your message..."
        style={styles.input}
        placeholderTextColor="#6B6B6B"
        value={inputText}
        onChangeText={setInputText}
        multiline
        maxLength={500}
      />
      <Button
        size="lg"
        variant="purple"
        radius="full"
        onPress={handleSend}
        disabled={inputText.trim() === '' || isLoading}>
        <AppText weight="medium" style={{ color: 'white' }}>
          Send
        </AppText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderWidth: 0,
    borderRadius: 12,
    padding: 10,
    margin: 10,
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
  },
  button: {
    backgroundColor: '#D9C7F5',
  },
});
