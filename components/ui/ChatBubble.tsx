import { ModalProps, View } from 'react-native';
import { AppText } from './AppText';
import { StyleSheet } from 'react-native';

type Props = ModalProps & {
  text: string;
  type?: 'user' | 'safi';
};

export default function ChatBubble({ text, type }: Props) {
  return (
    <View style={type === 'safi' ? styles.safiContainer : styles.userContainer}>
      <AppText style={type === 'safi' ? styles.safiText : styles.userText}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safiContainer: {
    width: '90%',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
  },
  userContainer: {
    width: '90%',
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderBottomRightRadius: 0,
  },
  safiText: {
    color: 'white',
    fontSize: 16,
  },
  userText: {
    color: 'black',
    fontSize: 16,
  },
});
