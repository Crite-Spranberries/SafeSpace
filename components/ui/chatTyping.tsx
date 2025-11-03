import { View } from 'react-native';
import { Input } from './input';
import { StyleSheet } from 'react-native';
import { Icon } from './icon';
import { Mic } from 'lucide-react-native';
import { Button } from './button';

export default function ChatTyping() {
  return (
    <View style={styles.container}>
      <Button size="icon" variant="ghost" radius="full" style={styles.button}>
        <Icon as={Mic} size={24} color="#5E349E" />
      </Button>
      <Input
        placeholder="Type your message..."
        style={styles.input}
        placeholderTextColor="#6B6B6B"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#E8E8E8',
    borderWidth: 0,
    borderRadius: 12,
    padding: 10,
    margin: 10,
    flex: 1,
  },
  button: {
    backgroundColor: '#D9C7F5',
  },
});
