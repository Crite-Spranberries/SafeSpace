import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import { LinearGradient } from 'expo-linear-gradient';

const audioSource = require('@/assets/audio/test_audio.mp3');

const SCREEN_OPTIONS = {
  title: 'Recording Details',
  headerBackTitle: 'Back',
};

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
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
});
