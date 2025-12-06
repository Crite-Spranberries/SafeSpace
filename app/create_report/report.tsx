import { TouchableOpacity, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useNavigation } from 'expo-router';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { AppText } from '@/components/ui/AppText';
import Recommendation from '@/components/ui/Recommendation';
import { addReport, reportDataToStoredReport } from '@/lib/reports';
import { ReportData, mergeReportData, createReportDataFromDate } from '@/lib/reportData';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import { generateReport } from '@/lib/ai';
import { useState, useEffect } from 'react';
import { getResourceLinksForActions } from '@/lib/worksafebcResources';
import * as Location from 'expo-location';

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
      // Ensure location_coords is properly formatted as [number, number]
      if (parsed.location_coords && Array.isArray(parsed.location_coords)) {
        parsed.location_coords = [
          typeof parsed.location_coords[0] === 'number'
            ? parsed.location_coords[0]
            : parseFloat(parsed.location_coords[0]) || 0,
          typeof parsed.location_coords[1] === 'number'
            ? parsed.location_coords[1]
            : parseFloat(parsed.location_coords[1]) || 0,
        ] as [number, number];
      }
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
  // Format time in 12-hour format with AM/PM
  const formatTime = (timeValue: number): string => {
    const hours24 = Math.floor(timeValue / 100);
    const minutes = timeValue % 100;
    const hours12 = hours24 % 12 || 12; // Convert to 12-hour format (0 becomes 12)
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    return `${hours12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const time = reportData
    ? formatTime(reportData.time)
    : (params.time as string) || 'No time provided';
  const location =
    reportData?.location_name || (params.location as string) || 'No location provided';
  const reportType =
    reportData?.report_type ||
    (params.reportType
      ? (() => {
          try {
            return JSON.parse(params.reportType as string);
          } catch {
            return [];
          }
        })()
      : []);
  const tradesField =
    reportData?.trades_field ||
    (params.tradesField
      ? (() => {
          try {
            return JSON.parse(params.tradesField as string);
          } catch {
            return [];
          }
        })()
      : []);
  const report_desc =
    reportData?.report_desc || (params.description as string) || 'No description provided.';
  const witnesses =
    reportData?.witnesses ||
    (params.witnesses
      ? (() => {
          try {
            const parsed = JSON.parse(params.witnesses as string);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            // If it's not JSON, treat it as a comma-separated string or single value
            const value = params.witnesses as string;
            if (value && value !== 'No witnesses provided.' && value.trim()) {
              return value.includes(',') ? value.split(',').map((s) => s.trim()) : [value.trim()];
            }
            return [];
          }
        })()
      : []);
  const individualsInvolved =
    reportData?.primaries_involved ||
    (params.individualsInvolved
      ? (() => {
          try {
            const parsed = JSON.parse(params.individualsInvolved as string);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            // If it's not JSON, treat it as a comma-separated string or single value
            const value = params.individualsInvolved as string;
            if (value && value !== 'No individuals involved provided.' && value.trim()) {
              return value.includes(',') ? value.split(',').map((s) => s.trim()) : [value.trim()];
            }
            return [];
          }
        })()
      : []);
  const actionsTaken =
    reportData?.actions_taken ||
    (params.actionsTaken
      ? (() => {
          try {
            const parsed = JSON.parse(params.actionsTaken as string);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            // If it's not JSON, treat it as a comma-separated string or single value
            const value = params.actionsTaken as string;
            if (value && value !== 'No actions taken provided.' && value.trim()) {
              return value.includes(',') ? value.split(',').map((s) => s.trim()) : [value.trim()];
            }
            return [];
          }
        })()
      : []);
  const reportTitle =
    reportData?.report_title || (params.reportTitle as string) || 'Incident Report';
  const [userLocation, setUserLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const [defaultLocationCoords, setDefaultLocationCoords] = useState<[number, number]>([0, 0]);
  const [defaultLocationName, setDefaultLocationName] = useState<string>('');

  // Get user's current location on mount if no location is provided
  useEffect(() => {
    const getCurrentLocation = async () => {
      // Only fetch if we don't have valid coordinates
      const hasValidCoords =
        (reportData?.location_coords &&
          reportData.location_coords[0] !== 0 &&
          reportData.location_coords[1] !== 0) ||
        false;

      if (!hasValidCoords) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode to get address
            let locationName = '';
            try {
              const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
              locationName = (geo as any).name
                ? `${(geo as any).name}, ${(geo as any).city}, ${(geo as any).region}`
                : (geo as any).city
                  ? `${(geo as any).city}, ${(geo as any).region}`
                  : '';
            } catch (geoErr) {
              console.warn('Failed to reverse geocode location', geoErr);
            }

            const userLoc = {
              name: locationName || 'Current Location',
              coords: [latitude, longitude] as [number, number],
            };
            setUserLocation(userLoc);
            setDefaultLocationCoords(userLoc.coords);
            setDefaultLocationName(userLoc.name);
          }
        } catch (err) {
          console.warn('Failed to get current location', err);
        }
      }
    };

    getCurrentLocation();
  }, []);

  const locationCoords =
    reportData?.location_coords &&
    reportData.location_coords[0] !== 0 &&
    reportData.location_coords[1] !== 0
      ? reportData.location_coords
      : defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0
        ? defaultLocationCoords
        : [0, 0];

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
                  coords: locationCoords as [number, number],
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

          // Preserve location coordinates from original reportData first (before AI generation)
          // This ensures coordinates from the form/edit page are not lost
          const originalCoords = reportData?.location_coords;
          const hasOriginalCoords =
            originalCoords &&
            Array.isArray(originalCoords) &&
            originalCoords.length === 2 &&
            typeof originalCoords[0] === 'number' &&
            typeof originalCoords[1] === 'number' &&
            originalCoords[0] !== 0 &&
            originalCoords[1] !== 0 &&
            !isNaN(originalCoords[0]) &&
            !isNaN(originalCoords[1]) &&
            Math.abs(originalCoords[0]) <= 90 &&
            Math.abs(originalCoords[1]) <= 180;

          const mergedReportData = mergeReportData(
            {
              ...generated.data,
              report_title: generated.data.report_title || reportTitle,
              location_name: generated.data.location_name || location || '',
              location_coords: hasOriginalCoords
                ? (originalCoords as [number, number])
                : locationCoords[0] !== 0 && locationCoords[1] !== 0
                  ? (locationCoords as [number, number])
                  : generated.data.location_coords &&
                      Array.isArray(generated.data.location_coords) &&
                      generated.data.location_coords.length === 2 &&
                      generated.data.location_coords[0] !== 0 &&
                      generated.data.location_coords[1] !== 0
                    ? (generated.data.location_coords as [number, number])
                    : defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0
                      ? defaultLocationCoords
                      : [0, 0],
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

  // Get location coordinates - prioritize from displayReportData, then reportData, then locationCoords
  const getValidCoords = (
    coords: [number, number] | number[] | undefined
  ): [number, number] | undefined => {
    if (!coords || !Array.isArray(coords) || coords.length !== 2) return undefined;
    const lat = typeof coords[0] === 'number' ? coords[0] : parseFloat(String(coords[0])) || 0;
    const lng = typeof coords[1] === 'number' ? coords[1] : parseFloat(String(coords[1])) || 0;
    if (lat === 0 && lng === 0) return undefined;
    if (isNaN(lat) || isNaN(lng)) return undefined;
    // Validate latitude/longitude ranges
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined;
    return [lat, lng] as [number, number];
  };

  const displayLocationCoords: [number, number] | undefined =
    getValidCoords(displayReportData?.location_coords) ||
    getValidCoords(reportData?.location_coords) ||
    getValidCoords(locationCoords) ||
    (defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0
      ? defaultLocationCoords
      : undefined);

  const displayLocation =
    displayReportData?.location_name ||
    reportData?.location_name ||
    (location && location !== 'No location provided' ? location : defaultLocationName) ||
    'No location provided';

  // Debug logging for coordinates
  useEffect(() => {
    console.log('Report page - Coordinate check:', {
      hasDisplayReportData: !!displayReportData,
      displayReportDataCoords: displayReportData?.location_coords,
      hasReportData: !!reportData,
      reportDataCoords: reportData?.location_coords,
      locationCoords,
      finalDisplayCoords: displayLocationCoords,
      displayLocation,
    });
  }, [displayReportData, reportData, locationCoords, displayLocationCoords, displayLocation]);

  // Get resource links for recommended actions
  const actionsWithLinks = getResourceLinksForActions(displayRecommendedActions, displayReportType);

  // Show full-screen loading overlay while generating
  if (isGenerating) {
    return (
      <>
        <LinearGradient
          colors={['#371F5E', '#000']}
          locations={[0, 0.3]}
          style={styles.background}
        />
        <Stack.Screen options={SCREEN_OPTIONS} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF5656" />
          <AppText style={{ color: '#FFFFFF', marginTop: 16, fontSize: 18 }}>
            Generating Report...
          </AppText>
        </SafeAreaView>
      </>
    );
  }

  function onEdit() {
    const cleanDesc = report_desc === 'No description provided.' ? '' : report_desc;

    // Pass the full reportData if available, including coordinates
    const reportDataToPass = displayReportData || reportData;

    router.push({
      pathname: '/my_logs/myPostEdit',
      params: {
        // Pass structured reportData if available (includes coordinates)
        ...(reportDataToPass ? { reportData: JSON.stringify(reportDataToPass) } : {}),
        // Legacy params for backward compatibility
        date,
        timestamp: time,
        location: displayLocation,
        report_type: JSON.stringify(displayReportType),
        trades_field: JSON.stringify(displayTradesField),
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

      // Determine the best coordinates to use - prioritize displayLocationCoords, then generatedReportData, then reportData, then defaultLocationCoords
      const coordsToSave: [number, number] =
        displayLocationCoords && displayLocationCoords[0] !== 0 && displayLocationCoords[1] !== 0
          ? (displayLocationCoords as [number, number])
          : generatedReportData?.location_coords &&
              generatedReportData.location_coords[0] !== 0 &&
              generatedReportData.location_coords[1] !== 0
            ? (generatedReportData.location_coords as [number, number])
            : reportData?.location_coords &&
                reportData.location_coords[0] !== 0 &&
                reportData.location_coords[1] !== 0
              ? (reportData.location_coords as [number, number])
              : locationCoords[0] !== 0 && locationCoords[1] !== 0
                ? (locationCoords as [number, number])
                : defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0
                  ? defaultLocationCoords
                  : [0, 0];

      console.log('Saving report - Coordinates:', {
        displayLocationCoords,
        generatedReportDataCoords: generatedReportData?.location_coords,
        reportDataCoords: reportData?.location_coords,
        locationCoords,
        coordsToSave,
      });

      if (generatedReportData) {
        // Use AI-generated report data, but ensure coordinates are preserved
        finalReportData = mergeReportData(
          {
            ...generatedReportData,
            report_id: reportId,
            report_method: 'manual_form',
            isPublic: false,
            audio_URI: '',
            audio_duration: 0,
            // Preserve coordinates from the best available source
            location_coords: coordsToSave,
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
            // Use actual coordinates from the best available source
            location_coords: coordsToSave,
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
              {((displayLocationCoords &&
                displayLocationCoords[0] !== 0 &&
                displayLocationCoords[1] !== 0) ||
                (defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0)) && (
                <MapOnDetail
                  coordinates={
                    displayLocationCoords &&
                    displayLocationCoords[0] !== 0 &&
                    displayLocationCoords[1] !== 0
                      ? displayLocationCoords
                      : defaultLocationCoords[0] !== 0 && defaultLocationCoords[1] !== 0
                        ? defaultLocationCoords
                        : undefined
                  }
                  address={
                    displayLocation && displayLocation !== 'No location provided'
                      ? displayLocation
                      : defaultLocationName || 'Current Location'
                  }
                />
              )}
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

            {displayRecommendedActions.length > 0 && (
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
          <Button
            variant="purple"
            size="lg"
            radius="full"
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 44 }}
            onPress={onSave}>
            <AppText
              weight="medium"
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                textAlign: 'center',
                lineHeight: 20,
                includeFontPadding: false,
              }}>
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
