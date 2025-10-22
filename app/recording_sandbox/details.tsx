import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

const audioSource = require('@/assets/audio/test_audio.mp3');

export default function Details() {
  const player = useAudioPlayer(audioSource);
  const [status, setStatus] = useState('Stopped');

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (statusUpdate) => {
      setStatus(
        statusUpdate.playing
          ? 'Playing'
          : statusUpdate.currentTime && statusUpdate.currentTime > 0
            ? 'Paused'
            : 'Stopped'
      );
    });

    return () => subscription?.remove();
  }, [player]);

  return (
    <>
      <View style={styles.container}>
        <Text variant="h3">Audio Status: {status}</Text>
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

        <View style={styles.buttonJustify}>
          <Button>
            <Text>Edit</Text>
          </Button>
          <Link href="./report" asChild>
            <Button>
              <Text>Generate Report</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    margin: 10,
  },
  buttonJustify: {
    alignContent: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
});
