import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

const audioSource = require('./assets/Hello.mp3');

export default function Details() {
  const player = useAudioPlayer(audioSource);
  return (
    <>
      <Text>Details...</Text>
      <View style={styles.container}>
        <Button onPress={() => player.play()}>
          <Text>Play Sound</Text>
        </Button>
        <Button
          onPress={() => {
            player.seekTo(0);
            player.play();
          }}>
          <Text>Replay Sound</Text>
        </Button>
      </View>
      <Link href="./report" asChild>
        <Button>
          <Text>Create Report</Text>
        </Button>
      </Link>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    margin: 10,
  },
});
