import { Button } from '@/components/ui/Button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { ArrowLeft, Trash2, PenLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import RecordingCardSmall from '@/components/ui/RecordingCardSmall';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import {
  deleteRecording as deleteStoredRecording,
  updateRecording,
  getRecordingById,
} from '@/lib/recordings';
import { generateReport } from '@/lib/ai';
import { addReport, reportDataToStoredReport, getReportByRecordingId } from '@/lib/reports';
import { mergeReportData, createReportDataFromDate, ReportData } from '@/lib/reportData';
import { lockState } from '@/lib/lockState';

// ✅ securely load your API key from .env file.
const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * Formats date from ReportData structure
 */
const formatDateFromReportData = (reportData?: Partial<ReportData>): string => {
  if (reportData?.month && reportData?.day && reportData?.year) {
    return `${reportData.month} ${reportData.day}, ${reportData.year}`;
  }
  return '';
};

/**
 * Formats time from ReportData structure (time is stored as HHMM, e.g., 1015 for 10:15)
 */
const formatTimeFromReportData = (reportData?: Partial<ReportData>): string => {
  if (reportData?.time) {
    const hours = Math.floor(reportData.time / 100);
    const minutes = reportData.time % 100;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  }
  return '';
};

export default function MyRecordingDetails() {
  const params = useLocalSearchParams<{
    audioUri?: string;
    title?: string;
    date?: string;
    timestamp?: string;
    duration?: string;
    recordingId?: string;
    immutable?: string;
    transcript?: string;
    report?: string;
    reportData?: string; // JSON string of ReportData
  }>();
  const audioUriParam = typeof params.audioUri === 'string' ? params.audioUri : null;
  const titleParam = typeof params.title === 'string' ? params.title : null;
  const dateParam = typeof params.date === 'string' ? params.date : null;
  const timestampParam = typeof params.timestamp === 'string' ? params.timestamp : null;
  const durationParam = typeof params.duration === 'string' ? params.duration : null;
  const recordingIdParam = typeof params.recordingId === 'string' ? params.recordingId : null;
  const transcriptParam = typeof params.transcript === 'string' ? params.transcript : null;
  const reportParam = typeof params.report === 'string' ? params.report : null;
  const isImmutable = params.immutable === '1';
  const [defAud, setDefAud] = useState<string | null>(null);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const [status, setStatus] = useState('Stopped');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recordingData, setRecordingData] = useState<any>(null);

  // Load recording data on mount
  useEffect(() => {
    const loadData = async () => {
      if (recordingIdParam) {
        const data = await getRecordingById(recordingIdParam);
        setRecordingData(data);
      } else if (params.reportData) {
        // If reportData is passed as param, parse it
        try {
          const parsed = JSON.parse(params.reportData);
          setRecordingData({ reportData: parsed });
        } catch (e) {
          console.warn('Failed to parse reportData param', e);
        }
      }
    };
    loadData();
  }, [recordingIdParam, params.reportData]);

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
  // const Transcribe = async (def: boolean = false) => {
  //   const _auduri = def ? defAud : audioUriParam;

  //   if (!_auduri) {
  //     Alert.alert('Missing audio to transcribe');
  //     return;
  //   }

  //   try {
  //     const _resp = await FileSystem.uploadAsync(
  //       'https://api.openai.com/v1/audio/transcriptions',
  //       _auduri,
  //       {
  //         headers: { Authorization: `Bearer ${apiKey}` },
  //         httpMethod: 'POST',
  //         uploadType: FileSystem.FileSystemUploadType.MULTIPART,
  //         fieldName: 'file',
  //         mimeType: 'audio/m4a',
  //         parameters: { model: 'gpt-4o-mini-transcribe' },
  //       }
  //     );

  //     const _json = JSON.parse(_resp.body);
  //     if (_json.text) {
  //       setAudTranscribed(_json.text);
  //       await AsyncStorage.setItem('transcribe', JSON.stringify(_json.text));
  //     }
  //   } catch (err) {
  //     Alert.alert('Transcription Error', String(err));
  //   }
  // };

  // // Playback functions
  // const playRecording = () => {
  //   if (audioUriParam) {
  //     setActiveUri(audioUriParam);
  //     player.play();
  //   } else {
  //     Alert.alert('No recording available');
  //   }
  // };

  // const playDefault = () => {
  //   if (defAud) {
  //     setActiveUri(defAud);
  //     player.play();
  //   } else {
  //     Alert.alert('Default audio not loaded');
  //   }
  // };

  const handleGenerateReport = async () => {
    // Get existing recording data to merge with
    let existingRecording = null;
    if (recordingIdParam) {
      existingRecording = await getRecordingById(recordingIdParam);
    }

    // Use transcript from params, recording data, or fail
    const transcriptToUse = transcriptParam || existingRecording?.transcript;

    if (!transcriptToUse || transcriptToUse.trim().length === 0) {
      Alert.alert(
        'No Transcript',
        'Cannot generate a report without a transcript. Please ensure the recording has been transcribed.'
      );
      return;
    }

    try {
      setIsGenerating(true);

      // Parse date from params or use current date
      const reportDate =
        dateParam && timestampParam ? new Date(`${dateParam} ${timestampParam}`) : new Date();

      console.log('Generating report with transcript length:', transcriptToUse.length);
      const generated = await generateReport(transcriptToUse, {
        audioUri: audioUriParam || undefined,
        date: reportDate,
        location: existingRecording?.reportData?.location_coords
          ? {
              name: existingRecording.reportData.location_name || existingRecording.location || '',
              coords: existingRecording.reportData.location_coords,
            }
          : existingRecording?.location
            ? { name: existingRecording.location }
            : undefined,
      });

      if (generated) {
        // Merge with existing recording data if available
        const baseDataPartial = existingRecording?.reportData
          ? { ...existingRecording.reportData }
          : createReportDataFromDate(reportDate, audioUriParam || undefined);

        // Ensure baseData is a full ReportData by merging with defaults
        const baseData = mergeReportData(baseDataPartial);

        const reportData = mergeReportData(
          {
            ...generated.data,
            // Only override title if AI didn't generate one, otherwise use AI-generated title
            report_title: generated.data.report_title || titleParam || 'Generated Report',
            audio_URI: audioUriParam || baseData.audio_URI || '',
            // Prefer AI-extracted location, fall back to existing
            location_name:
              generated.data.location_name ||
              existingRecording?.reportData?.location_name ||
              existingRecording?.location ||
              baseData.location_name ||
              '',
            // Use coordinates from existing recording or generated data
            location_coords: existingRecording?.reportData?.location_coords ||
              generated.data.location_coords ||
              baseData.location_coords || [0, 0],
            // Store the transcript in report_transcript field
            report_transcript: transcriptToUse,
          },
          baseData
        );

        // 1. Save to Reports
        const newReportId = `${reportDate.getTime()}_report`;
        const storedReport = reportDataToStoredReport(
          reportData,
          newReportId,
          recordingIdParam || undefined
        );
        await addReport(storedReport);

        // 2. Update Recording with report data
        if (recordingIdParam) {
          await updateRecording(recordingIdParam, {
            report: generated.text, // Legacy support
            reportData: reportData, // New structured data
          });
          // Reload recording data to reflect updates
          const updatedRecording = await getRecordingById(recordingIdParam);
          setRecordingData(updatedRecording);
        }

        // 3. Navigate
        router.push({
          pathname: '/my_logs/myPostDetails',
          params: {
            report: generated.text,
            title: reportData.report_title,
            id: newReportId,
          },
        });
      } else {
        Alert.alert('Generation Failed', 'Could not generate report. Please try again.');
      }
    } catch (err) {
      console.error('Manual report generation failed', err);
      Alert.alert('Error', 'An error occurred while generating the report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          lockState.shouldUnlockMyLogs = true;
          router.back();
        }}>
        <Icon as={ArrowLeft} size={16} />
      </TouchableOpacity>
    ),
  };

  const { showConfirmation } = useConfirmation();

  // Extract data from reportData or fall back to params
  const reportData = recordingData?.reportData;
  const hasReport = !!(reportData?.report_desc && reportData.report_desc.trim().length > 0);

  // Title: Always use recording title format (not report title, since user hasn't viewed report yet)
  const displayTitle = titleParam || 'Voice Recording';

  // Date/Time: Use structured data if report exists, otherwise use params
  const displayDate = hasReport
    ? formatDateFromReportData(reportData) || dateParam || ''
    : dateParam || '';
  const displayTime = hasReport
    ? formatTimeFromReportData(reportData) || timestampParam || ''
    : timestampParam || '';

  const displayLocation =
    reportData?.location_name || recordingData?.location || 'Location not specified';
  // Extract coordinates - ensure they're valid before passing
  const displayCoordinates: [number, number] | undefined =
    reportData?.location_coords &&
    Array.isArray(reportData.location_coords) &&
    reportData.location_coords.length === 2 &&
    typeof reportData.location_coords[0] === 'number' &&
    typeof reportData.location_coords[1] === 'number' &&
    !isNaN(reportData.location_coords[0]) &&
    !isNaN(reportData.location_coords[1]) &&
    !(reportData.location_coords[0] === 0 && reportData.location_coords[1] === 0)
      ? (reportData.location_coords as [number, number])
      : undefined;

  // Debug logging for coordinates
  useEffect(() => {
    console.log('myRecordingDetails - Coordinates check:', {
      hasReportData: !!reportData,
      location_coords: reportData?.location_coords,
      displayCoordinates,
      location_name: reportData?.location_name,
    });
  }, [reportData, displayCoordinates]);

  // Report types: Show from reportData (AI-generated from transcript analysis), otherwise from tags
  const reportTypes = reportData?.report_type || recordingData?.tags || [];

  // Trade fields and report description: Only if report has been generated
  const tradesFields = hasReport ? reportData?.trades_field || [] : [];
  const reportDescription = hasReport ? reportData?.report_desc || '' : '';

  // Transcript: Use report_transcript from reportData, fall back to transcriptParam or recording transcript
  const displayTranscript =
    reportData?.report_transcript || transcriptParam || recordingData?.transcript || '';

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppText weight="bold" style={styles.title}>
              {displayTitle}
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>{displayDate}</AppText>
              <AppText style={styles.subtitleText}>{displayTime}</AppText>
            </View>
            <RecordingCardSmall
              style={styles.recordingCard}
              duration={durationParam ?? undefined}
              source={activeUri ?? undefined}
            />
            <MapOnDetail
              address={displayLocation}
              coordinates={displayCoordinates}
              style={styles.mapOnDetail}
            />

            {/* Report Type Section - Shows AI-generated violation tags from transcript analysis */}
            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Report Type
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reportTypes.length > 0 ? (
                  reportTypes.map((tag: string, index: number) => (
                    <Badge key={index} variant="darkGrey" className="mr-2 px-4">
                      <AppText style={styles.badgeText} weight="medium">
                        {tag}
                      </AppText>
                    </Badge>
                  ))
                ) : (
                  <AppText style={{ color: '#B0B0B0', fontSize: 16 }}>Not Specified</AppText>
                )}
              </ScrollView>
            </View>

            {/* Transcript - Always show if available */}
            {displayTranscript ? (
              <View style={styles.transcriptSection}>
                <View style={styles.transcriptHeader}>
                  <AppText style={styles.transcriptTitle} weight="medium">
                    AI Transcript
                  </AppText>
                  <AppText style={styles.transcriptModel}>GPT-4o</AppText>
                </View>
                <AppText style={styles.transcriptText}>{displayTranscript}</AppText>
              </View>
            ) : null}

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
                      month: reportData?.month || '',
                      day: reportData?.day?.toString() || '',
                      year: reportData?.year?.toString() || '',
                      time: reportData?.time?.toString() || '',
                      duration: durationParam ?? '',
                      location: reportData?.location_name || recordingData?.location || '',
                      report_type: JSON.stringify(
                        reportData?.report_type || recordingData?.tags || []
                      ),
                      witnesses: JSON.stringify(reportData?.witnesses || []),
                      primaries_involved: JSON.stringify(reportData?.primaries_involved || []),
                      actions_taken: JSON.stringify(reportData?.actions_taken || []),
                    },
                  });
                }}>
                <Icon as={PenLine} color="#5E349E" size={24} />
              </TouchableOpacity>
              {reportParam ? (
                <Button
                  variant="purple"
                  radius="full"
                  style={styles.generateButton}
                  onPress={async () => {
                    // Find the report ID from the recording
                    let reportId: string | null = null;

                    if (recordingIdParam) {
                      const report = await getReportByRecordingId(recordingIdParam);
                      if (report) {
                        reportId = report.id;
                      }
                    }

                    // Fallback: use report_id from reportData if available
                    if (!reportId && reportData?.report_id) {
                      reportId = reportData.report_id;
                    }

                    if (reportId) {
                      router.push({
                        pathname: '/my_logs/myPostDetails',
                        params: {
                          id: reportId,
                        },
                      });
                    } else {
                      // Fallback to old navigation if report ID not found
                      router.push({
                        pathname: '/my_logs/myPostDetails',
                        params: {
                          report: reportParam,
                          title: titleParam || 'Generated Report',
                        },
                      });
                    }
                  }}>
                  <AppText weight="medium" style={styles.reportGenText}>
                    View Report
                  </AppText>
                </Button>
              ) : (
                <Button
                  variant="purple"
                  radius="full"
                  style={styles.generateButton}
                  onPress={handleGenerateReport}
                  disabled={isGenerating}>
                  {isGenerating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <AppText weight="medium" style={styles.reportGenText}>
                      Generate Report
                    </AppText>
                  )}
                </Button>
              )}
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
