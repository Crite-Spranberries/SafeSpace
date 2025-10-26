import React, { useState, useEffect, useRef } from 'react';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, useRouter } from 'expo-router';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { PlayPauseButton } from '@/components/ui/PlayPause_button';
import { Switch } from '@/components/ui/switch';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  setIsAudioActiveAsync,
} from 'expo-audio';

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

export default function Recording() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [segments, setSegments] = useState<{ uri: string; duration: number }[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (recorderState.isRecording) {
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
  }, [recorderState.isRecording]);

  const startRecording = async () => {
    try {
      await setAudioModeAsync({
        allowsRecording: true, // or false as needed
        playsInSilentMode: true, // MUST be true with duckOthers on iOS
        interruptionMode: 'duckOthers', // acceptable with playsInSilentMode: true
      });
      await setIsAudioActiveAsync(true);
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error starting recording', error.message);
      } else {
        Alert.alert('Error starting recording', String(error));
      }
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri!;
      const duration = elapsedSeconds - segments.reduce((sum, seg) => sum + seg.duration, 0);
      setSegments((prev) => [...prev, { uri, duration }]);

      // Switch audio mode to playback mode for louder iOS playback
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
      });
      await setIsAudioActiveAsync(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Error stopping recording', error.message);
      } else {
        Alert.alert('Error stopping recording', String(error));
      }
    }
  };

  const toggleRecording = () => {
    if (recorderState.isRecording) stopRecording();
    else startRecording();
  };

  const saveRecording = () => {
    if (segments.length === 0) {
      Alert.alert('No recording to save');
      // return;
    } else {}
    const lastSegment = segments.length >0 ? segments[segments.length - 1] : null;
    router.push({
      pathname: '/recording_sandbox/details',
      params: {
        audioUri: lastSegment !== null ? lastSegment.uri : null,
        totalDuration: elapsedSeconds.toString(),
      },
    });
  };

  const cancelRecording = () => {
    setElapsedSeconds(0);
    setSegments([]);
    setIsPlaying(false);
    if (recorderState.isRecording) {
      audioRecorder.stop();
    }
  };

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePlayPausePress = () => {
    togglePlayback();
    toggleRecording();
  };

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission to access microphone was denied');
        }
        // Set audio mode for recording initially
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: false,
          interruptionMode: 'duckOthers',
        });
        await setIsAudioActiveAsync(true);
      } catch (error) {
        console.warn('Audio permission or mode setup failed:', error);
      }
    })();
  }, []);

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
        <Switch checked={isChecked} onCheckedChange={setIsChecked} />
      </View>
      <Text variant="h2">{formatTime(elapsedSeconds)}</Text>
      <View style={styles.controls}>
        <Button variant="cancelRecording" size="customRecordingSmall" onPress={cancelRecording}>
          <X />
        </Button>
        <PlayPauseButton isPlaying={isPlaying} onPress={handlePlayPausePress} />
        <Button variant="saveRecording" size="customRecordingSmall" onPress={saveRecording}>
          <Check />
        </Button>
      </View>
    </View>
      </SafeAreaView>
    </>
  );
}

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
    justifyContent: 'space-around',
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
