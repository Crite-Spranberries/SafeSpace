import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, PenLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import Recommendation from '@/components/ui/Recommendation';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { loadReports, StoredReport, reportToReportData } from '@/lib/reports';
import { ReportData } from '@/lib/reportData';
import { getResourceLinksForActions } from '@/lib/worksafebcResources';

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

export default function MyPostDetails() {
  const params = useLocalSearchParams<{
    report?: string;
    title?: string;
    id?: string;
    date?: string;
    timestamp?: string;
    location?: string;
    tags?: string;
    report_type?: string;
    trades_field?: string;
    status?: string;
  }>();
  const idParam = typeof params.id === 'string' ? params.id : null;
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load report data on mount
  useEffect(() => {
    const loadReport = async () => {
      if (idParam) {
        try {
          setIsLoading(true);
          const reports = await loadReports();
          const report = reports.find((r) => r.id === idParam);
          if (report) {
            // Convert StoredReport to full ReportData
            const fullReportData = reportToReportData(report);
            console.log('Loaded report data:', fullReportData);
            setReportData(fullReportData);
            setIsPublic(fullReportData.isPublic);
          } else {
            console.warn('Report not found:', idParam);
          }
        } catch (err) {
          console.error('Failed to load report', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [idParam]);

  // Extract display values from reportData or fall back to params
  // Prioritize reportData fields since they come from AI analysis
  const displayTitle = reportData?.report_title || params.title || 'Report Details';
  const displayDate = reportData
    ? formatDateFromReportData(reportData) || params.date || ''
    : params.date || '';
  const displayTime = reportData
    ? formatTimeFromReportData(reportData) || params.timestamp || ''
    : params.timestamp || '';
  const displayLocation = reportData?.location_name || params.location || 'Location not specified';
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
    console.log('myPostDetails - Coordinates check:', {
      hasReportData: !!reportData,
      location_coords: reportData?.location_coords,
      displayCoordinates,
      location_name: reportData?.location_name,
    });
  }, [reportData, displayCoordinates]);

  // Use reportData arrays directly - these come from AI analysis of the transcript
  const reportTypes = reportData?.report_type || [];
  const tradesFields = reportData?.trades_field || [];
  const reportDescription = reportData?.report_desc || params.report || 'No report available.';
  const recommendedActions = reportData?.recommended_actions || [];

  // Get resource links for recommended actions (only for serious reports)
  const actionsWithLinks = getResourceLinksForActions(recommendedActions, reportTypes);

  // Debug logging
  useEffect(() => {
    if (reportData) {
      console.log('myPostDetails - Report data loaded:', {
        reportTypes,
        recommendedActions,
        actionsWithLinks,
      });
    }
  }, [reportData, reportTypes, recommendedActions, actionsWithLinks]);

  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          lockState.shouldUnlockMyLogs = true;
          router.push('/(tabs)/myLogs');
        }}>
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
              {displayTitle}
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>{displayDate}</AppText>
              <AppText style={styles.subtitleText}>{displayTime}</AppText>
            </View>
            <MapOnDetail
              address={displayLocation}
              coordinates={displayCoordinates}
              style={styles.mapOnDetail}
            />

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

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Trades Field
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tradesFields.length > 0 ? (
                  tradesFields.map((tag: string, index: number) => (
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

            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <AppText style={styles.transcriptTitle} weight="medium">
                  AI Summary
                </AppText>
                <AppText style={styles.transcriptModel}>GPT-4o</AppText>
              </View>
              <AppText style={styles.transcriptText}>{reportDescription}</AppText>
            </View>

            <View style={styles.recommendationsSection}>
              <AppText weight="medium" style={styles.recommendTitle}>
                Recommended Actions
              </AppText>
              {recommendedActions.length > 0 ? (
                actionsWithLinks.map(({ action, link }, index: number) => (
                  <Recommendation key={index} text={action} resourceLink={link} />
                ))
              ) : (
                <AppText style={{ color: '#B0B0B0', fontSize: 16 }}>No recommended actions</AppText>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.reportIcon}
                onPress={async () => {
                  const confirmed = await showConfirmation({
                    title: 'Delete Report?',
                    description:
                      "Are you sure you want to delete this report? You can't undo this.",
                    cancelText: 'Cancel',
                    confirmText: 'Delete',
                    confirmVariant: 'destructive',
                  });

                  if (confirmed) {
                    if (idParam) {
                      await deleteReport(idParam);
                      Alert.alert('Deleted', 'Report has been deleted.', [
                        {
                          text: 'OK',
                          onPress: () => {
                            lockState.shouldUnlockMyLogs = true;
                            router.navigate('/(tabs)/myLogs');
                          },
                        },
                      ]);
                    } else {
                      Alert.alert('Error', 'Could not delete report: ID missing.');
                    }
                  }
                }}>
                <Icon as={Trash2} color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => {
                  router.push('/my_logs/myPostEdit');
                }}>
                <Icon as={PenLine} color="#5E349E" size={24} />
              </TouchableOpacity>
              <Button
                variant={isPublic ? 'darkGrey' : 'purple'}
                radius="full"
                style={styles.postButton}
                onPress={async () => {
                  if (!isPublic) {
                    // Going from private -> public
                    const confirmed = await showConfirmation({
                      title: 'Post Report Publicly?',
                      description: (
                        <AppText style={styles.confirmationDescription}>
                          Your report will now be <AppText weight="bold">visible</AppText> to all
                          SafeSpace users. Personal or identifying information will be{' '}
                          <AppText weight="bold">censored</AppText> to protect your privacy.
                        </AppText>
                      ),
                      cancelText: 'Cancel',
                      confirmText: 'Post Publicly',
                      confirmVariant: 'purple',
                    });

                    if (confirmed) {
                      if (idParam) {
                        await updateReportStatus(idParam, 'Posted');
                        setIsPublic(true);
                        router.setParams({ status: 'Posted' });
                        Alert.alert('Posted', 'Report has been made public.');
                      } else {
                        Alert.alert('Error', 'Could not update report: ID missing.');
                      }
                    }
                  } else {
                    // Going from public -> private
                    const confirmed = await showConfirmation({
                      title: 'Make Report Private?',
                      description: (
                        <AppText style={styles.confirmationDescription}>
                          Your report will no longer be public. Any comments received on this report
                          will be deleted.
                        </AppText>
                      ),
                      cancelText: 'Cancel',
                      confirmText: 'Make Private',
                      confirmVariant: 'purple',
                    });

                    if (confirmed) {
                      if (idParam) {
                        await updateReportStatus(idParam, 'Private');
                        setIsPublic(false);
                        router.setParams({ status: 'Private' });
                        Alert.alert('Updated', 'Report has been made private.');
                      } else {
                        Alert.alert('Error', 'Could not update report: ID missing.');
                      }
                    }
                  }
                }}>
                <AppText weight="medium" style={styles.reportPostText}>
                  {isPublic ? 'Make Private' : 'Post Publicly'}
                </AppText>
              </Button>
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
    marginBottom: 24,
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
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  mapOnDetail: {
    marginBottom: 24,
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 36,
  },
  recommendTitle: {
    fontSize: 20,
    color: '#fff',
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
  reportPostText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
  },
  postButton: {
    height: 52,
    width: 193,
  },
  confirmationDescription: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
  },
});
