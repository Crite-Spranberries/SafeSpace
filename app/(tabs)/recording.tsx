import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { StyleSheet, View, Image } from 'react-native';
import { X } from 'lucide-react-native';
import { Check } from 'lucide-react-native';
import { PlayPauseButton } from '@/components/ui/PlayPause_button';
import { Switch } from '@/components/ui/switch';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Generated calculations for time formatting
function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Generated calculations for the dummy timelapse/stamp simulation. For elapsed time and clearing it when cancelled.
export default function Recording() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying]);
  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  // Switch state
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.columnOrientation}>
          <Image
            source={require('@/assets/images/dummy-wave-graphic.png')}
            style={{ width: 200, height: 200 }}
          />

          <View style={styles.rowOrientation}>
            <Text>Enable Video</Text>
            <Switch checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked)} />
          </View>

          <Text variant="h2">{formatTime(elapsedSeconds)}</Text>
          {/*This is the play/pause activated simulated timestamp*/}
          <View style={styles.controls}>
            <Button
              variant="cancelRecording"
              size="customRecordingSmall"
              onPress={() => {
                setElapsedSeconds(0); // Reset the timer to 0
                setIsPlaying(false); // Set play state to paused
              }}>
              <X />
            </Button>
            <PlayPauseButton isPlaying={isPlaying} onPress={togglePlayback} />
            <Link href="/recording_sandbox/details" asChild>
              <Button variant="saveRecording" size="customRecordingSmall">
                <Check />
              </Button>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

// To style the bottom control positioning.
const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    height: 200,
    gap: 16,
  },
  columnOrientation: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: 20,
  },
  rowOrientation: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    gap: 15,
    padding: 20,
  },
  video: {
    width: 350,
    height: 275,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
});
