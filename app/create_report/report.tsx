import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useNavigation } from 'expo-router';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { ScrollView } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import Recommendation from '@/components/ui/Recommendation';
import { addReport, reportDataToStoredReport } from '@/lib/reports';
import { ReportData, mergeReportData, createReportDataFromDate } from '@/lib/reportData';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import { generateReport } from '@/lib/ai';
import { useState, useEffect } from 'react';
import { getResourceLinksForActions } from '@/lib/worksafebcResources';

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

// Helper function to get month index
function getMonthIndex(monthName: string): number {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return months.indexOf(monthName);
}

export default function Report() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { showConfirmation } = useConfirmation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReportData, setGeneratedReportData] = useState<ReportData | null>(null);

  // Try to load structured reportData first, fall back to legacy params
  let reportData: ReportData | null = null;
  if (params.reportData) {
    try {
      const parsed = JSON.parse(params.reportData as string);
      // Merge with defaults to ensure all fields are present
      const baseData = createReportDataFromDate(
        new Date(parsed.year, getMonthIndex(parsed.month), parsed.day)
      );
      reportData = mergeReportData(parsed, mergeReportData(baseData));
    } catch (e) {
      console.warn('Failed to parse reportData', e);
    }
  }

  // Fallback to legacy params if reportData not available
  const date = reportData
    ? `${reportData.month} ${reportData.day}, ${reportData.year}`
    : (params.date as string) || 'No date provided';
  const time = reportData
    ? `${Math.floor(reportData.time / 100)}:${String(reportData.time % 100).padStart(2, '0')}`
    : (params.time as string) || 'No time provided';
  const location =
    reportData?.location_name || (params.location as string) || 'No location provided';
  const reportType =
    reportData?.report_type || (params.reportType ? JSON.parse(params.reportType as string) : []);
  const tradesField =
    reportData?.trades_field ||
    (params.tradesField ? JSON.parse(params.tradesField as string) : []);
  const report_desc =
    reportData?.report_desc || (params.description as string) || 'No description provided.';
  const witnesses =
    reportData?.witnesses || (params.witnesses ? JSON.parse(params.witnesses as string) : []);
  const individualsInvolved =
    reportData?.primaries_involved ||
    (params.individualsInvolved ? JSON.parse(params.individualsInvolved as string) : []);
  const actionsTaken =
    reportData?.actions_taken ||
    (params.actionsTaken ? JSON.parse(params.actionsTaken as string) : []);
  const reportTitle =
    reportData?.report_title || (params.reportTitle as string) || 'Incident Report';
  const locationCoords = reportData?.location_coords || [0, 0];

  // Generate report when component mounts if we have description
  useEffect(() => {
    const generateAIReport = async () => {
      if (!report_desc || report_desc === 'No description provided.' || generatedReportData) {
        return; // Don't generate if no description or already generated
      }

      try {
        setIsGenerating(true);
        const descriptionText = report_desc;

        // Parse date from reportData or params
        let reportDate = new Date();
        if (reportData) {
          const monthIndex = getMonthIndex(reportData.month);
          reportDate = new Date(reportData.year, monthIndex, reportData.day);
          // Set time
          const hours = Math.floor(reportData.time / 100);
          const minutes = reportData.time % 100;
          reportDate.setHours(hours, minutes);
        } else if (params.date) {
          reportDate = new Date(params.date as string);
        }

        console.log('Generating report from manual form description');
        const generated = await generateReport(descriptionText, {
          date: reportDate,
          location:
            locationCoords[0] !== 0 && locationCoords[1] !== 0
              ? {
                  name: location,
                  coords: locationCoords,
                }
              : location && location !== 'No location provided'
                ? { name: location }
                : undefined,
        });

        if (generated) {
          // Merge with form data
          const baseDataPartial = reportData
            ? { ...reportData }
            : createReportDataFromDate(reportDate);
          const baseData = mergeReportData(baseDataPartial);

          // Capitalize first letter of tags
          const capitalizeFirstLetter = (str: string): string => {
            if (!str || str.length === 0) return str;
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
          };

          const capitalizeTags = (tags: string[]): string[] => {
            return tags.map((tag) => {
              // Handle multi-word tags (e.g., "Anti-LGBTQ+ Discrimination")
              return tag
                .split(/[\s-]+/)
                .map((word) => capitalizeFirstLetter(word))
                .join(tag.includes('-') ? '-' : ' ');
            });
          };

          const mergedReportData = mergeReportData(
            {
              ...generated.data,
              report_title: generated.data.report_title || reportTitle,
              location_name: generated.data.location_name || location || '',
              location_coords:
                locationCoords[0] !== 0 && locationCoords[1] !== 0
                  ? locationCoords
                  : generated.data.location_coords || [0, 0],
              report_type: capitalizeTags(
                generated.data.report_type && generated.data.report_type.length > 0
                  ? generated.data.report_type
                  : reportType
              ),
              trades_field: capitalizeTags(
                generated.data.trades_field && generated.data.trades_field.length > 0
                  ? generated.data.trades_field
                  : tradesField
              ),
              primaries_involved:
                generated.data.primaries_involved && generated.data.primaries_involved.length > 0
                  ? generated.data.primaries_involved
                  : individualsInvolved,
              witnesses:
                generated.data.witnesses && generated.data.witnesses.length > 0
                  ? generated.data.witnesses
                  : witnesses,
              actions_taken:
                generated.data.actions_taken && generated.data.actions_taken.length > 0
                  ? generated.data.actions_taken
                  : actionsTaken,
            },
            baseData
          );

          setGeneratedReportData(mergedReportData);
        }
      } catch (err) {
        console.error('Failed to generate report', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateAIReport();
  }, []); // Only run once on mount

  // Use generated data if available, otherwise use form data
  const displayReportData = generatedReportData || reportData;
  const displayReportDesc = displayReportData?.report_desc || report_desc;
  const displayReportType = displayReportData?.report_type || reportType;
  const displayTradesField = displayReportData?.trades_field || tradesField;
  const displayRecommendedActions = displayReportData?.recommended_actions || [];
  const displayLocationCoords = displayReportData?.location_coords || locationCoords;
  const displayLocation = displayReportData?.location_name || location;

  // Get resource links for recommended actions
  const actionsWithLinks = getResourceLinksForActions(displayRecommendedActions, displayReportType);

  function onEdit() {
    const cleanDesc = report_desc === 'No description provided.' ? '' : report_desc;

    router.push({
      pathname: '/my_logs/myPostEdit',
      params: {
        date,
        timestamp: time,
        location,
        report_type: JSON.stringify(reportType),
        trades_field: JSON.stringify(tradesField),
        description: cleanDesc,
        witnesses: JSON.stringify(witnesses),
        primaries_involved: JSON.stringify(individualsInvolved),
        actions_taken: JSON.stringify(actionsTaken),
        reportTitle,
      },
    });
  }

  async function onSave() {
    try {
      const createdAt = new Date();
      const reportId = `${createdAt.getTime()}_report`;

      // Use generated report data if available, otherwise use form data
      let finalReportData: ReportData;
      if (generatedReportData) {
        // Use AI-generated report data
        finalReportData = mergeReportData(
          {
            ...generatedReportData,
            report_id: reportId,
            report_method: 'manual_form',
            isPublic: false,
            audio_URI: '',
            audio_duration: 0,
          },
          mergeReportData(createReportDataFromDate(createdAt))
        );
      } else {
        // Fallback: build from legacy params
        const dateObj = new Date(date);
        const month = dateObj.toLocaleString('default', { month: 'long' });
        const day = dateObj.getDate();
        const year = dateObj.getFullYear();
        const hour = dateObj.getHours();
        const minute = dateObj.getMinutes();
        const timeValue = hour * 100 + minute;

        const baseData = createReportDataFromDate(createdAt);
        finalReportData = mergeReportData(
          {
            isPublic: false,
            report_method: 'manual_form',
            report_id: reportId,
            report_title: reportTitle || 'Incident Report',
            month,
            day,
            year,
            time: timeValue,
            audio_URI: '',
            audio_duration: 0,
            location_name: location && location !== 'No location provided' ? location : '',
            location_coords: [0, 0],
            report_type: Array.isArray(reportType) ? reportType : [],
            trades_field: Array.isArray(tradesField) ? tradesField : [],
            report_desc: report_desc || '',
            report_transcript: report_desc || '',
            primaries_involved: Array.isArray(individualsInvolved) ? individualsInvolved : [],
            witnesses: Array.isArray(witnesses) ? witnesses : [],
            actions_taken: Array.isArray(actionsTaken) ? actionsTaken : [],
            recommended_actions: [],
          },
          mergeReportData(baseData)
        );
      }

      // Convert to StoredReport and save
      const payload = reportDataToStoredReport(finalReportData, reportId);
      await addReport(payload);
    } catch (e) {
      console.warn('Failed to save report', e);
    }
    const confirmed = await showConfirmation({
      title: 'Report Saved',
      description: (
        <AppText style={styles.confirmationDescription}>
          Your report has been saved.{'\n'}
          Go to My Logs to post it publicly.
        </AppText>
      ),
      cancelText: 'Back to Home',
      confirmText: 'My Logs',
      confirmVariant: 'purple',
    });

    if (confirmed) {
      router.push('/(tabs)/myLogs');
    } else {
      router.push('/(tabs)');
    }
  }

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <AppText weight="medium" style={styles.title}>
              {reportTitle}
            </AppText>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <AppText style={styles.descriptionWhite}>{date}</AppText>
              <AppText style={styles.descriptionWhite}>{time}</AppText>
            </View>
            <View className="w-full max-w-md">
              <MapOnDetail
                coordinates={
                  displayLocationCoords &&
                  displayLocationCoords[0] !== 0 &&
                  displayLocationCoords[1] !== 0
                    ? displayLocationCoords
                    : undefined
                }
                address={
                  displayLocation && displayLocation !== 'No location provided'
                    ? displayLocation
                    : undefined
                }
              />
            </View>
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Report Type
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {displayReportType.length > 0 ? (
                  displayReportType.map((tag: string, index: number) => (
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
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Trades Field
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {displayTradesField.length > 0 ? (
                  displayTradesField.map((tag: string, index: number) => (
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
            {isGenerating ? (
              <View>
                <AppText style={styles.descriptionWhite}>Generating AI report...</AppText>
              </View>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText weight="medium" style={styles.subHeader}>
                    AI Summary
                  </AppText>
                  <AppText style={{ color: '#B0B0B0' }}>GPT-4o</AppText>
                </View>
                <AppText style={styles.descriptionWhite}>
                  {displayReportDesc ?? 'No description provided.'}
                </AppText>
              </View>
            )}

            {!isGenerating && displayRecommendedActions.length > 0 && (
              <View style={styles.recommendationsSection}>
                <AppText weight="medium" style={styles.subHeader}>
                  Recommended Actions
                </AppText>
                {actionsWithLinks.map(({ action, link }, index: number) => (
                  <Recommendation key={index} text={action} resourceLink={link} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 24, gap: 24 }}>
          <Button
            variant="reallyLightGrey"
            size="lg"
            radius="full"
            style={{ flex: 1 }}
            onPress={onEdit}>
            <AppText weight="medium" style={{ color: '#5E349E', fontSize: 16 }}>
              Edit
            </AppText>
          </Button>
          <Button variant="purple" size="lg" radius="full" style={{ flex: 1 }} onPress={onSave}>
            <AppText weight="medium" style={{ color: '#FFFFFF', fontSize: 16 }}>
              Save Report
            </AppText>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 10,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 8,
    color: '#FFF',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 30,
    color: '#FFF',
  },
  descriptionBlack: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  descriptionWhite: {
    fontSize: 16,
    color: '#fff',
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  badgeText: {
    color: '#FFF',
    marginHorizontal: 8,
    fontSize: 16,
  },

  confirmationDescription: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
  },
});
