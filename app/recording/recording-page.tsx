import React, { useCallback, useEffect, useState } from 'react';
import { AppText } from '@/components/ui/AppText';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
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

const ensureRecordingPermissions = async () => {
  const status = await AudioModule.getRecordingPermissionsAsync();
  if (status.granted) return true;

  const requested = await AudioModule.requestRecordingPermissionsAsync();
  return requested.granted;
};

export default function Recording() {
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
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const status = recorder.getStatus();
      const recordingUri = status.url;

      if (!recordingUri) {
        Alert.alert('Save Failed', 'No recording file was generated.');
        return;
      }

      const createdAt = new Date();
      const durationMillis = status.durationMillis;
      const durationLabel = formatDuration(durationMillis);
      const title = `Recording ${formatDate(createdAt)} ${formatTime(createdAt)}`;

      const payload = {
        id: `${createdAt.getTime()}`,
        uri: recordingUri,
        title,
        date: formatDate(createdAt),
        timestamp: formatTime(createdAt),
        durationMillis,
        durationLabel,
        createdAtISO: createdAt.toISOString(),
        tags: ['Recorded'],
        location: undefined,
      };

      await addRecording(payload);

      expoRouter.push({
        pathname: '/my_logs/my-recording-details',
        params: {
          audioUri: recordingUri,
          recordingId: payload.id,
          title: payload.title,
          date: payload.date,
          timestamp: payload.timestamp,
          duration: durationLabel,
        },
      });
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Recording Error', 'Unable to stop and save the recording.');
    } finally {
      setSaving(false);
    }
  }, [expoRouter, recorder, recorderState.isRecording, saving]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <View style={styles.pageContainer}>
          <AppText weight="bold" style={styles.pageTitle}>
            View Recording
          </AppText>
          <RoundRecordingButton
            isRecording={recorderState.isRecording}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </View>
      </SafeAreaView>
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
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    lineHeight: 28,
    color: '#fff',
  },
});
