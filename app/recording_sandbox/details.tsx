import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ securely load your API key from .env file.
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function Details() {
  const { audioUri } = useLocalSearchParams();
  const [defAud, setDefAud] = useState<string | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const [status, setStatus] = useState('Stopped');
  const [audTranscribed, setAudTranscribed] = useState<string>(
    'Parsed data from the audio would ideally go here.'
  );

  // Load default audio file for fallback playback
  useEffect(() => {
    const init = async () => {
      const [{ localUri }] = await Asset.loadAsync(require('@/assets/audio/default.m4a'));
      setDefAud(localUri);
      setActiveUri(localUri);
    };
    init();
  }, []);

  // Initialize player based on activeUri
  const player = useAudioPlayer({ uri: activeUri ?? '' });

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

  // Unified transcription handler for recorded/default files
  const Transcribe = async (def: boolean = false) => {
    const _auduri = def ? defAud : typeof audioUri === 'string' ? audioUri : null;

    if (!_auduri) {
      Alert.alert('Missing audio to transcribe');
      return;
    }

    try {
      const _resp = await FileSystem.uploadAsync(
        'https://api.openai.com/v1/audio/transcriptions',
        _auduri,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType: 'audio/m4a',
          parameters: { model: 'gpt-4o-mini-transcribe' },
        }
      );

      const _json = JSON.parse(_resp.body);
      if (_json.text) {
        setAudTranscribed(_json.text);
        await AsyncStorage.setItem('transcribe', JSON.stringify(_json.text));
      }
    } catch (err) {
      Alert.alert('Transcription Error', String(err));
    }
  };

  // Playback functions
  const playRecording = () => {
    if (typeof audioUri === 'string') {
      setActiveUri(audioUri);
      player.play();
    } else {
      Alert.alert('No recording available');
    }
  };

  const playDefault = () => {
    if (defAud) {
      setActiveUri(defAud);
      player.play();
    } else {
      Alert.alert('Default audio not loaded');
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Button
            disabled={!audioUri}
            onPress={() => {
              Transcribe(false);
              playRecording();
            }}>
            <Text>Transcribe Recording</Text>
          </Button>
          <Button
            onPress={() => {
              Transcribe(true);
              playDefault();
            }}>
            <Text>Transcribe Default</Text>
          </Button>
        </View>

        <Text variant="h4">Voice Recording: {status}</Text>

        <View style={styles.container}>
          <Button onPress={playRecording}>
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
        <DescriptionCard description={audTranscribed} />

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
    </ScrollView>
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
