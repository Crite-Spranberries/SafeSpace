import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import Recommendation from '@/components/ui/Recommendation';
import defaultPostsData from '@/assets/data/default_posts.json';
import { ReportData, mergeReportData } from '@/lib/reportData';
import { getResourceLinksForActions } from '@/lib/worksafebcResources';
import { filterReportForPublic, filterRecommendedActionsForPublic } from '@/lib/privacyFilter';

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

export default function Details() {
  const params = useLocalSearchParams<{ id?: string; isUserReport?: string }>();
  const idParam = typeof params.id === 'string' ? params.id : null;
  const isUserReport = params.isUserReport === 'true';
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load post data from JSON file or user reports on mount
  useEffect(() => {
    const loadPost = async () => {
      if (idParam) {
        try {
          setIsLoading(true);
          if (isUserReport) {
            // Load from user reports
            const { loadReports, reportToReportData } = await import('@/lib/reports');
            const reports = await loadReports();
            const report = reports.find((r) => r.id === idParam);
            if (report) {
              let fullReportData = reportToReportData(report);
              // Generate filtered description and actions if they don't exist and report is public
              if (fullReportData.isPublic) {
                if (fullReportData.report_desc && !fullReportData.report_desc_filtered) {
                  fullReportData.report_desc_filtered = filterReportForPublic(
                    fullReportData.report_desc,
                    fullReportData.primaries_involved
                  );
                }
                if (
                  fullReportData.recommended_actions &&
                  fullReportData.recommended_actions.length > 0 &&
                  !fullReportData.recommended_actions_filtered
                ) {
                  fullReportData.recommended_actions_filtered = filterRecommendedActionsForPublic(
                    fullReportData.recommended_actions,
                    fullReportData.primaries_involved
                  );
                }
              }
              setReportData(fullReportData);
            } else {
              console.warn('Report not found:', idParam);
            }
          } else {
            // Load from default posts
            const post = (defaultPostsData as any[]).find((p) => p.id === idParam);
            if (post && post.reportData) {
              // Convert to full ReportData
              let fullReportData = mergeReportData(post.reportData);
              // Generate filtered description and actions if they don't exist and report is public
              if (fullReportData.isPublic) {
                if (fullReportData.report_desc && !fullReportData.report_desc_filtered) {
                  fullReportData.report_desc_filtered = filterReportForPublic(
                    fullReportData.report_desc,
                    fullReportData.primaries_involved
                  );
                }
                if (
                  fullReportData.recommended_actions &&
                  fullReportData.recommended_actions.length > 0 &&
                  !fullReportData.recommended_actions_filtered
                ) {
                  fullReportData.recommended_actions_filtered = filterRecommendedActionsForPublic(
                    fullReportData.recommended_actions,
                    fullReportData.primaries_involved
                  );
                }
              }
              setReportData(fullReportData);
            } else {
              console.warn('Post not found:', idParam);
            }
          }
        } catch (err) {
          console.error('Failed to load post', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadPost();
  }, [idParam, isUserReport]);

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

  // Extract display values from reportData
  const displayTitle = reportData?.report_title || 'Post Details';
  const displayDate = reportData ? formatDateFromReportData(reportData) : '';
  const displayTime = reportData ? formatTimeFromReportData(reportData) : '';
  const displayLocation = reportData?.location_name || 'Location not specified';
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

  // Use reportData arrays directly
  const reportTypes = reportData?.report_type || [];
  const tradesFields = reportData?.trades_field || [];
  // Use filtered description for public display (if available, otherwise filter on-the-fly)
  const reportDescription = reportData?.report_desc
    ? reportData.report_desc_filtered ||
      filterReportForPublic(reportData.report_desc, reportData.primaries_involved)
    : 'No report available.';
  // Use filtered recommended actions for public display (if available, otherwise filter on-the-fly)
  const recommendedActions =
    reportData?.recommended_actions && reportData.recommended_actions.length > 0
      ? reportData.recommended_actions_filtered ||
        filterRecommendedActionsForPublic(
          reportData.recommended_actions,
          reportData.primaries_involved
        )
      : [];

  // Get resource links for recommended actions
  const actionsWithLinks = getResourceLinksForActions(recommendedActions, reportTypes);

  if (isLoading) {
    return (
      <>
        <LinearGradient
          colors={['#371F5E', '#000']}
          locations={[0, 0.3]}
          style={styles.background}
        />
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Stack.Screen options={SCREEN_OPTIONS} />
          <View style={styles.container}>
            <AppText style={{ color: '#fff' }}>Loading...</AppText>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
    marginBottom: 24,
  },
  recommendTitle: {
    fontSize: 20,
    color: '#fff',
  },
});
