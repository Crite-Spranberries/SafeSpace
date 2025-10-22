import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';

export default function Details() {
  // Get audioUri passed as URL param
  const { audioUri } = useLocalSearchParams();

  // Fallback audio source if param missing
  const defaultAudioSource = require('@/assets/audio/test_audio.mp3');

  // Use the recorded audio URI if provided, else fallback
  const player = useAudioPlayer(audioUri ? { uri: audioUri } : defaultAudioSource);
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
        <Text variant="h4">"Voice Recording": {status}</Text>
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
        <Text>Tags</Text>
        <View style={styles.tagAlign}>
          <Badge>
            <Text>Longshore</Text>
          </Badge>
          <Badge>
            <Text>Harassment</Text>
          </Badge>
          <Badge>
            <Text>Warning</Text>
          </Badge>
        </View>

        <Text>AI Transcript</Text>
        <DescriptionCard description="Parsed data from the audio would ideally go here." />

        <View style={styles.bottomButtonAlign}>
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
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 10,
  },
  bottomButtonAlign: {
    alignContent: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  tagAlign: {
    alignContent: 'center',
    flexDirection: 'row',
    gap: 24,
  },
});
