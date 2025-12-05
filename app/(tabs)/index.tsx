import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, SunIcon, Plus, Locate } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native';
import MapOnHome from '@/components/ui/MapOnHome';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Text } from '@/components/ui/Text';
import HomeTopBar from '@/components/ui/HomeTopBar';
import { useRouter } from 'expo-router';
import { loadAllPublicReports, StoredReport } from '@/lib/reports';
import ReportCard from '@/components/ui/ReportCard';
import { filterReportForPublic } from '@/lib/privacyFilter';
import { useFocusEffect } from 'expo-router';

export default function Home() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const [address, setAddress] = React.useState<string | null>(null);
  const [publicReports, setPublicReports] = React.useState<StoredReport[]>([]);
  const [selectedReport, setSelectedReport] = React.useState<StoredReport | null>(null);
  const insets = useSafeAreaInsets();

  // Ref for map actions
  const mapRef = React.useRef<any>(null);

  // Load public reports when page is focused
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const reports = await loadAllPublicReports();
          if (isActive) {
            setPublicReports(reports);
          }
        } catch (err) {
          console.warn('Failed to load public reports', err);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Convert StoredReport to PublicReport format for map
  const publicReportsForMap = React.useMemo(() => {
    return publicReports
      .map((report) => {
        const coordinates =
          report.reportData?.location_coords &&
          Array.isArray(report.reportData.location_coords) &&
          report.reportData.location_coords.length === 2 &&
          typeof report.reportData.location_coords[0] === 'number' &&
          typeof report.reportData.location_coords[1] === 'number' &&
          !isNaN(report.reportData.location_coords[0]) &&
          !isNaN(report.reportData.location_coords[1]) &&
          !(
            report.reportData.location_coords[0] === 0 && report.reportData.location_coords[1] === 0
          )
            ? (report.reportData.location_coords as [number, number])
            : undefined;

        return {
          id: report.id,
          title: report.title,
          location: report.location,
          coordinates,
        };
      })
      .filter((report) => report.coordinates !== undefined);
  }, [publicReports]);

  const onDetails = () => {
    router.push('/create_report');
  };

  const onCenterLocation = () => {
    mapRef.current?.centerOnUser();
  };

  const handleReportMarkerPress = (reportId: string) => {
    const report = publicReports.find((r) => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      // Center map on the report location
      const coordinates = publicReportsForMap.find((r) => r.id === reportId)?.coordinates;
      if (coordinates) {
        mapRef.current?.centerOnReport(coordinates[0], coordinates[1]);
      }
    }
  };

  const handleReportCardPress = () => {
    if (selectedReport) {
      // All public reports go to postDetails to show filtered version
      router.push({
        pathname: '/posts_browsing/postDetails',
        params: {
          id: selectedReport.id,
          isUserReport: selectedReport.id.startsWith('post-') ? 'false' : 'true',
        },
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapOnHome
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onAddressChange={setAddress}
        publicReports={publicReportsForMap}
        onReportMarkerPress={handleReportMarkerPress}
      />
      <SafeAreaView
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
        pointerEvents="box-none">
        <View
          style={{
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}>
          <HomeTopBar
            address={address}
            glass
            borderColor="rgba(255,255,255,0.5)"
            borderWidth={1}
            radius={24}
          />
          <Text variant="h4" style={{ marginTop: 20, fontSize: 24 }}>
            Nearby Reports
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 5,
            width: '100%',
          }}
          pointerEvents="auto">
          {/* Container for location button and report card */}
          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              marginBottom: 16,
            }}>
            {/* Center map button - always on the right */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginBottom: selectedReport ? 12 : 0,
              }}>
              <Pressable
                onPress={onCenterLocation}
                style={{
                  backgroundColor: '#fff',
                  padding: 14,
                  borderRadius: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 7,
                  elevation: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Locate color="#8449DF" size={28} />
              </Pressable>
            </View>

            {/* Selected report card - full width below button */}
            {selectedReport && (
              <ReportCard
                tags={selectedReport.report_type || selectedReport.tags || []}
                title={selectedReport.title}
                location={selectedReport.location}
                excerpt={
                  selectedReport.excerpt
                    ? filterReportForPublic(
                        selectedReport.excerpt,
                        selectedReport.reportData?.primaries_involved
                      )
                    : undefined
                }
                date={selectedReport.date}
                timestamp={selectedReport.timestamp}
                onDetailsPress={handleReportCardPress}
                onClose={() => setSelectedReport(null)}
              />
            )}
          </View>

          {/* Create Report button (remains centered at bottom) */}
          <Button
            radius="full"
            style={{
              width: '90%',
              minHeight: 56,
              paddingVertical: 16,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
            }}
            onPress={onDetails}>
            <AppText
              style={{
                fontSize: 20,
                lineHeight: 24,
                textAlignVertical: 'center',
                fontWeight: '500',
                marginRight: 8,
              }}
              weight="medium">
              Create Report
            </AppText>
            <Plus color="#8449DF" size={28} />
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ...ThemeToggle and styles unchanged
