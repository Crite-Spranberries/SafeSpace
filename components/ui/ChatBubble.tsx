import { ModalProps, View } from 'react-native';
import { AppText } from './AppText';
import { StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { Button } from './Button';
import { Icon } from './Icon';
import { Volume2 } from 'lucide-react-native';

type Props = ModalProps & {
  text: string;
  type?: 'user' | 'safi';
  onPress?: () => void;
  isAuto?: boolean;
};

export default function ChatBubble({ text, type, onPress, isAuto }: Props) {
  return (
    <View style={type === 'safi' ? styles.safiContainer : styles.userContainer}>
      {type === 'safi' && !isAuto && (
        <Button size="icon" variant="ghost" radius="full" onPress={onPress} style={styles.button}>
          <Icon as={Volume2} size={24} color={type === 'safi' ? 'white' : 'black'} />
        </Button>
      )}

      <AppText style={type === 'safi' ? styles.safiText : styles.userText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safiContainer: {
    maxWidth: '90%',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  userContainer: {
    maxWidth: '90%',
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderBottomRightRadius: 0,
  },
  safiText: {
    color: 'white',
    fontSize: 16,
    flexShrink: 1,
    flex: 1,
  },
  userText: {
    color: 'black',
    fontSize: 16,
  },
  button: {},
});
