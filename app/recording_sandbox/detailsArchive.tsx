import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react-native';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecordingCardSmall from '@/components/ui/RecordingCardSmall';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';

// ✅ securely load your API key from .env file.
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const SCREEN_OPTIONS = {
  title: 'Recording Details',
  headerBackTitle: 'Back',
};

export default function Details() {
  const { audioUri } = useLocalSearchParams();
  const [defAud, setDefAud] = useState<string | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const [status, setStatus] = useState('Stopped');
  const [audTranscribed, setAudTranscribed] = useState<string>(
    'Transcripter awaiting audio to parse.'
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

  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon as={ArrowLeft} size={24} />
      </TouchableOpacity>
    ),
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <AppText weight="bold" style={styles.title}>
              Voice Recording 1
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>November 4, 2025</AppText>
              <AppText style={styles.subtitleText}>10:15 AM</AppText>
            </View>
            <RecordingCardSmall style={{ marginBottom: 24 }} />
            <MapOnDetail address="3700 Willingdon Avenue, Burnaby" style={{ marginBottom: 24 }} />
            <View style={{ flexDirection: 'column', gap: 6 }}>
              <Button
                radius="full"
                variant="purple"
                disabled={!audioUri}
                onPress={() => {
                  Transcribe(false);
                  playRecording();
                }}>
                <Text>Transcribe Recording</Text>
              </Button>
              <Button
                radius="full"
                variant="lightGrey"
                onPress={() => {
                  Transcribe(true);
                  playDefault();
                }}>
                <Text>Transcribe Sample</Text>
              </Button>
            </View>

            <Text variant="h4">Recording Preview: {status}</Text>

            <View style={styles.container}>
              <Button onPress={playRecording} radius="full">
                <Text>Play Sound</Text>
              </Button>
              <Button
                variant="outline"
                radius="full"
                onPress={() => {
                  player.seekTo(0);
                  player.play();
                }}>
                <Text>Replay Sound</Text>
              </Button>
            </View>

            <Text>AI Transcript</Text>
            <DescriptionCard description={audTranscribed} />

            <View style={styles.buttonContainer}>
              <Button variant="lightGrey" radius="full" style={{ flex: 1, marginRight: 8 }}>
                <Text>Edit</Text>
              </Button>
              <Link href="./report" asChild>
                <Button variant="purple" radius="full" style={{ flex: 1 }}>
                  <Text>Generate Report</Text>
                </Button>
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
    // marginLeft: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    marginTop: 24,
    borderColor: 'transparent',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  subtitleText: {
    color: '#FFF',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
  },
});
