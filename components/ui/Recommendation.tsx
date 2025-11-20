import { AppText } from './AppText';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';

export default function Recommendation({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <AppText style={styles.text}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF4D',
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
