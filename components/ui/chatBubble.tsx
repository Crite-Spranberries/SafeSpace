import { ModalProps, View } from 'react-native';
import { AppText } from './AppText';
import { Button } from './button';
import { StyleSheet } from 'react-native';

type Props = ModalProps & {
  text: string;
  type?: 'user' | 'safi';
  withButtons?: string[];
};

export default function ChatBubble({ text, type, withButtons }: Props) {
  return (
    <View
      style={
        type === 'safi'
          ? styles.safiContainer
          : withButtons
            ? styles.buttonChatContainer
            : styles.userContainer
      }>
      <AppText style={type === 'safi' ? styles.safiText : styles.userText}>{text}</AppText>
      {withButtons && (
        <View style={styles.buttonsContainer}>
          {withButtons.map((button, index) => (
            <Button key={index} style={styles.button} onPress={() => {}}>
              <AppText>{button}</AppText>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safiContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.30)',
    borderColor: 'rgba(255, 255, 255, 0.50)',
    borderWidth: 1,
    padding: 12,
    borderBottomLeftRadius: 0,
    borderRadius: 12,
    maxWidth: 250,
  },
  buttonChatContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomRightRadius: 0,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  userContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomRightRadius: 0,
    borderRadius: 12,
    maxWidth: 250,
    alignSelf: 'flex-end',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#E8E8E8',
    minWidth: '48%',
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
