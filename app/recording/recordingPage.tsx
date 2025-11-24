import React, { useCallback, useEffect, useRef, useState } from 'react';
import usePreloadImages from '@/hooks/usePreloadImages';
import { AppText } from '@/components/ui/AppText';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { router, Stack, useRouter } from 'expo-router';
import RoundRecordingButton from '@/components/ui/RoundRecordingButton';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { addRecording } from '@/lib/recordings';
import { addReport } from '@/lib/reports';
import { transcribeAudio, generateReport } from '@/lib/ai';
import WaveForm from '@/components/ui/WaveForm';
import * as FileSystem from 'expo-file-system';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const ensureRecordingPermissions = async () => {
  const status = await AudioModule.getRecordingPermissionsAsync();
  if (status.granted) return true;

  const requested = await AudioModule.requestRecordingPermissionsAsync();
  return requested.granted;
};

export default function Recording() {
  // Preload the recording background image so ImageBackground renders smoothly
  const ready = usePreloadImages([require('@/assets/images/recording-background.png')]);
  const expoRouter = useRouter();
  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          router.push('/');
        }}>
        <Icon as={ArrowLeft} size={16} />
      </TouchableOpacity>
    ),
  };

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [saving, setSaving] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Animated values for ripple and pulse (breathing) effect
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] });
  const rippleOpacity = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.15] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  useEffect(() => {
    const rippleLoop = Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    rippleAnim.setValue(0);
    pulseAnim.setValue(0);
    rippleLoop.start();
    pulseLoop.start();

    return () => {
      rippleLoop.stop();
      pulseLoop.stop();
    };
  }, [rippleAnim, pulseAnim]);

  useEffect(() => {
    (async () => {
      const granted = await ensureRecordingPermissions();
      if (!granted) {
        Alert.alert('Microphone Access Required', 'Please enable microphone permissions to record');
      }
    })();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const granted = await ensureRecordingPermissions();
      if (!granted) {
        Alert.alert('Permission Needed', 'Microphone access is required to record audio.');
        return;
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      setRecordingDuration(0);
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Recording Error', 'Unable to start recording. Please try again.');
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    if (!recorderState.isRecording || saving) return;

    try {
      setSaving(true);

      // Capture duration before stopping
      const statusBeforeStop = recorder.getStatus();
      const finalDurationMillis = statusBeforeStop.durationMillis;

      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const status = recorder.getStatus(); // Gets the recorder status (uri, duration, etc.).
      const recordingUri = status.url; // The file URL of the recording.

      if (!recordingUri) {
        Alert.alert('Save Failed', 'No recording file was generated.');
        return;
      }

      const createdAt = new Date(); // Use current date/time as creation time.
      const durationMillis = finalDurationMillis || status.durationMillis; // Use captured duration or fallback
      const durationLabel = formatDuration(durationMillis); // Formatted duration string.
      const title = `Recording ${formatDate(createdAt)} ${formatTime(createdAt)}`; // Default title.

      let transcript: string | undefined;
      let report: string | undefined;
      try {
        console.log('Starting transcription...');
        transcript = await transcribeAudio(recordingUri);
        console.log('Transcription result:', transcript);

        if (transcript) {
          console.log('Starting report generation...');
          report = await generateReport(transcript);
          console.log('Report generation result:', report ? 'Success' : 'Failed');

          if (report) {
            await addReport({
              id: `${createdAt.getTime()}_report`,
              title: title || 'Generated Report',
              date: formatDate(createdAt),
              timestamp: formatTime(createdAt),
              status: 'Private',
              content: report,
              recordingId: `${createdAt.getTime()}`,
              tags: ['Sexism'],
              excerpt: report.substring(0, 100) + '...',
            });
          }
        }
      } catch (e) {
        console.log('Processing failed', e);
      }

      const payload = {
        id: `${createdAt.getTime()}`,
        uri: recordingUri,
        title,
        date: formatDate(createdAt),
        timestamp: formatTime(createdAt),
        durationMillis,
        durationLabel,
        createdAtISO: createdAt.toISOString(),
        tags: ['Sexism'],
        location: undefined,
        transcript,
        report,
      };

      await addRecording(payload);

      expoRouter.push({
        pathname: '/(tabs)/myLogs',
        // pathname: '/my_logs/myRecordingDetails',
        // params: {
        //   audioUri: recordingUri,
        //   recordingId: payload.id,
        //   title: payload.title,
        //   date: payload.date,
        //   timestamp: payload.timestamp,
        //   duration: durationLabel,
        //   transcript: payload.transcript,
        //   report: payload.report,
        // },
      });
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording Error', 'Unable to stop and save the recording.');
    } finally {
      setSaving(false);
      setRecordingDuration(0);
    }
  }, [expoRouter, recorder, recorderState.isRecording, saving]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (recorderState.isRecording) {
      const updateDuration = () => {
        const status = recorder.getStatus();
        const duration = typeof status.durationMillis === 'number' ? status.durationMillis : 0;
        setRecordingDuration(duration);
      };

      updateDuration();
      interval = setInterval(updateDuration, 200);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recorder, recorderState.isRecording]);

  const formatElapsed = (millis: number) => {
    if (!millis || millis < 0) {
      return '00:00:00';
    }
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (!ready) {
    return (
      <>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ImageBackground
        source={require('@/assets/images/recording-background.png')}
        style={styles.background}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.pageContainer}>
            <AppText weight="bold" style={styles.pageTitle}>
              Voice Recording
            </AppText>

            <View style={styles.waveContainer}>
              <WaveForm active={recorderState.isRecording} />
            </View>

            {recorderState.isRecording ? (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDotWrapper}>
                  <Animated.View
                    style={[
                      styles.ripple,
                      { transform: [{ scale: rippleScale }], opacity: rippleOpacity },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.pulse,
                      { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                    ]}
                  />
                  <View style={styles.recordingDot} />
                </View>
                <AppText weight="medium" style={styles.recordingTimer}>
                  {formatElapsed(recordingDuration)}
                </AppText>
              </View>
            ) : null}
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="large" color="#FF5656" />
                <AppText style={styles.savingText}>Transcribing...</AppText>
              </View>
            ) : (
              <View style={styles.recordingButtonContainer}>
                <RoundRecordingButton
                  isRecording={recorderState.isRecording}
                  onStart={startRecording}
                  onStop={stopRecording}
                />
              </View>
            )}
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const formatDuration = (millis: number) => {
  if (!millis || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const formatTime = (value: Date) =>
  value.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 28,
    color: '#fff',
    marginBottom: 90,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 226,
    height: 48,
    justifyContent: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 7,
    backgroundColor: '#FF5656',
  },
  recordingTimer: {
    fontSize: 40,
    lineHeight: 48,
    color: '#FFFFFF',
    width: 190,
  },
  waveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  recordingDotWrapper: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 24,
    backgroundColor: '#FF5656',
  },
  pulse: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 14,
    backgroundColor: '#FF5656',
  },
  recordingButtonContainer: {
    position: 'absolute',
    bottom: 50,
  },
  savingContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  savingText: {
    color: '#FFF',
    fontSize: 16,
  },
});
