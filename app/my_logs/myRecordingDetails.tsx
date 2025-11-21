import { Button } from '@/components/ui/Button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { ArrowLeft, Trash2, PenLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecordingCardSmall from '@/components/ui/RecordingCardSmall';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import { deleteRecording as deleteStoredRecording } from '@/lib/recordings';

// ✅ securely load your API key from .env file.
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export default function MyRecordingDetails() {
  const params = useLocalSearchParams<{
    audioUri?: string;
    title?: string;
    date?: string;
    timestamp?: string;
    duration?: string;
    recordingId?: string;
    immutable?: string;
  }>();
  const audioUriParam = typeof params.audioUri === 'string' ? params.audioUri : null;
  const titleParam = typeof params.title === 'string' ? params.title : null;
  const dateParam = typeof params.date === 'string' ? params.date : null;
  const timestampParam = typeof params.timestamp === 'string' ? params.timestamp : null;
  const durationParam = typeof params.duration === 'string' ? params.duration : null;
  const recordingIdParam = typeof params.recordingId === 'string' ? params.recordingId : null;
  const isImmutable = params.immutable === '1';
  const [defAud, setDefAud] = useState<string | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const [status, setStatus] = useState('Stopped');
  const [audTranscribed, setAudTranscribed] = useState<string>(
    'Transcripter awaiting audio to parse.'
  );

  // Load default audio file for fallback playback
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const [{ localUri }] = await Asset.loadAsync(require('@/assets/audio/test_audio.mp3'));
      if (!isMounted) return;
      setDefAud(localUri);
      setActiveUri((prev) => prev ?? audioUriParam ?? localUri);
    };
    init();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioUriParam) {
      setActiveUri(audioUriParam);
    }
  }, [audioUriParam]);

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
    const _auduri = def ? defAud : audioUriParam;

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
    if (audioUriParam) {
      setActiveUri(audioUriParam);
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
        <Icon as={ArrowLeft} size={16} />
      </TouchableOpacity>
    ),
  };

  const { showConfirmation } = useConfirmation();

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppText weight="bold" style={styles.title}>
              {titleParam ?? 'Voice Recording'}
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>{dateParam ?? 'November 4, 2025'}</AppText>
              <AppText style={styles.subtitleText}>{timestampParam ?? '10:15 AM'}</AppText>
            </View>
            <RecordingCardSmall
              style={styles.recordingCard}
              duration={durationParam ?? undefined}
              source={activeUri ?? undefined}
            />
            <MapOnDetail address="3700 Willingdon Avenue, Burnaby" style={styles.mapOnDetail} />

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Tags
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.badgeContainer}>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Harassment
                  </AppText>
                </Badge>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Electrical
                  </AppText>
                </Badge>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Warning
                  </AppText>
                </Badge>
              </ScrollView>
            </View>

            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <AppText style={styles.transcriptTitle} weight="medium">
                  AI Transcript
                </AppText>
                <AppText style={styles.transcriptModel}>GPT-4o</AppText>
              </View>
              <AppText style={styles.transcriptText}>
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
              </AppText>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.reportIcon}
                onPress={async () => {
                  if (isImmutable) {
                    Alert.alert('Protected Recording', 'Sample recordings cannot be deleted.');
                    return;
                  }
                  const confirmed = await showConfirmation({
                    title: 'Delete Recording?',
                    description:
                      "Are you sure you want to delete this recording? You can't undo this.",
                    cancelText: 'Cancel',
                    confirmText: 'Delete',
                    confirmVariant: 'destructive',
                  });

                  if (confirmed) {
                    try {
                      player.pause();
                      if (audioUriParam) {
                        try {
                          await FileSystem.deleteAsync(audioUriParam, { idempotent: true });
                        } catch (fileErr) {
                          console.warn('Failed to delete audio file', fileErr);
                        }
                      }
                      if (recordingIdParam) {
                        await deleteStoredRecording(recordingIdParam);
                      }
                      Alert.alert('Deleted', 'Recording has been deleted.', [
                        {
                          text: 'OK',
                          onPress: () => router.replace('/(tabs)/myLogs'),
                        },
                      ]);
                    } catch (err) {
                      console.error('Failed to delete recording', err);
                      Alert.alert('Delete Failed', 'Something went wrong deleting this recording.');
                    }
                  }
                }}>
                <Icon as={Trash2} color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => {
                  // Navigate to the edit screen, passing current recording metadata
                  router.push({
                    pathname: '/my_logs/myRecordingEdit',
                    params: {
                      recordingId: recordingIdParam ?? '',
                      audioUri: audioUriParam ?? '',
                      title: titleParam ?? '',
                      date: dateParam ?? '',
                      timestamp: timestampParam ?? '',
                      duration: durationParam ?? '',
                    },
                  });
                }}>
                <Icon as={PenLine} color="#5E349E" size={24} />
              </TouchableOpacity>
              <Link href="./myPostDetails" asChild>
                <Button variant="purple" radius="full" style={styles.generateButton}>
                  <AppText weight="medium" style={styles.reportGenText}>
                    Generate Report
                  </AppText>
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
    paddingHorizontal: 18,
    marginTop: 35,
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
  badgeSection: {
    marginBottom: 24,
  },
  badgeTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },
  badgeContainer: {
    // justifyContent: 'flex-start',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  transcriptSection: {
    marginBottom: 30,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 20,
    color: '#fff',
  },
  transcriptModel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  transcriptText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    height: 52,
  },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#4D4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#B2B2B2',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#efefefff',
    borderWidth: 1,
  },
  reportGenText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  recordingCard: {
    marginBottom: 24,
  },
  mapOnDetail: {
    marginBottom: 24,
  },
  generateButton: {
    height: 52,
    width: 193,
  },
});
