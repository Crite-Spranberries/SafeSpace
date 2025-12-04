import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';
import ReportCard from '@/components/ui/ReportCard';
import SearchSettings from '@/components/ui/SearchSettings';
import Tabs from '@/components/ui/Tabs';
import { useRouter, useFocusEffect } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { loadRecordings, StoredRecording } from '@/lib/recordings';
import { loadReports, StoredReport } from '@/lib/reports';
import PassCodeScreen from '@/components/ui/PassCodeScreen';
import { lockState } from '@/lib/lockState';

export default function MylogsPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [activeTab, setActiveTab] = useState<'recordings' | 'reports'>('recordings');
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (lockState.shouldUnlockMyLogs) {
        setIsLocked(false);
        lockState.shouldUnlockMyLogs = false; // Reset immediately
      } else {
        setIsLocked(true);
      }

      (async () => {
        try {
          const savedRecordings = await loadRecordings();
          const savedReports = await loadReports();
          if (isActive) {
            setRecordings(savedRecordings);
            setReports(savedReports);
          }
        } catch (err) {
          console.warn('Failed to load data', err);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleTabChange = (tab: 'recordings' | 'reports') => {
    setActiveTab(tab);
  };

  // Filter recordings based on search query
  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) {
      return recordings;
    }

    const query = searchQuery.toLowerCase().trim();
    return recordings.filter((recording) => {
      // Search in title
      if (recording.title?.toLowerCase().includes(query)) return true;

      // Search in location
      if (recording.location?.toLowerCase().includes(query)) return true;

      // Search in tags
      if (recording.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;

      // Search in reportData fields if available
      if (recording.reportData) {
        if (recording.reportData.report_title?.toLowerCase().includes(query)) return true;
        if (recording.reportData.location_name?.toLowerCase().includes(query)) return true;
        if (recording.reportData.report_desc?.toLowerCase().includes(query)) return true;
        if (recording.reportData.report_type?.some((tag) => tag.toLowerCase().includes(query)))
          return true;
        if (recording.reportData.trades_field?.some((tag) => tag.toLowerCase().includes(query)))
          return true;
      }

      // Search in transcript
      if (recording.transcript?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [recordings, searchQuery]);

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) {
      return reports;
    }

    const query = searchQuery.toLowerCase().trim();
    return reports.filter((report) => {
      // Search in title
      if (report.title?.toLowerCase().includes(query)) return true;

      // Search in excerpt/content
      if (report.excerpt?.toLowerCase().includes(query)) return true;
      if (report.content?.toLowerCase().includes(query)) return true;

      // Search in location
      if (report.location?.toLowerCase().includes(query)) return true;

      // Search in tags
      if (report.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;
      if (report.report_type?.some((tag) => tag.toLowerCase().includes(query))) return true;
      if (report.trades_field?.some((tag) => tag.toLowerCase().includes(query))) return true;

      // Search in reportData fields if available
      if (report.reportData) {
        if (report.reportData.report_title?.toLowerCase().includes(query)) return true;
        if (report.reportData.location_name?.toLowerCase().includes(query)) return true;
        if (report.reportData.report_desc?.toLowerCase().includes(query)) return true;
        if (report.reportData.report_type?.some((tag) => tag.toLowerCase().includes(query)))
          return true;
        if (report.reportData.trades_field?.some((tag) => tag.toLowerCase().includes(query)))
          return true;
      }

      return false;
    });
  }, [reports, searchQuery]);

  const onReportDetails = (report: StoredReport) => {
    router.push({
      pathname: '/my_logs/myPostDetails',
      params: {
        report: report.content,
        title: report.title,
        id: report.id,
        date: report.date,
        timestamp: report.timestamp,
        location: report.location,
        tags: report.tags ? JSON.stringify(report.tags) : JSON.stringify([]),
        report_type: report.report_type ? JSON.stringify(report.report_type) : JSON.stringify([]),
        trades_field: report.trades_field
          ? JSON.stringify(report.trades_field)
          : JSON.stringify([]),
        status: report.status,
      },
    });
  };

  const onRecording = (recording: StoredRecording) => {
    // Pass reportData as JSON string if available
    const reportDataParam = recording.reportData ? JSON.stringify(recording.reportData) : undefined;

    router.push({
      pathname: '/my_logs/myRecordingDetails',
      params: {
        audioUri: recording.uri,
        recordingId: recording.id,
        title: recording.title,
        date: recording.date,
        timestamp: recording.timestamp,
        duration: recording.durationLabel,
        immutable: recording.isImmutable ? '1' : '0',
        transcript: recording.transcript,
        report: recording.report,
        reportData: reportDataParam, // Pass structured data
      },
    });
  };

  if (isLocked) {
    return <PassCodeScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.header}>
          <AppText weight="bold" style={styles.pageTitle}>
            My Logs
          </AppText>
          <Tabs onTabChange={handleTabChange} tab={activeTab} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
          <View style={styles.contentContainer}>
            <SearchSettings
              style={styles.searchSettings}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {activeTab === 'recordings' ? (
              <>
                {filteredRecordings.length === 0 ? (
                  <AppText style={styles.emptyState}>
                    {recordings.length === 0
                      ? 'You have not saved any recordings yet. Start a recording to see it listed here.'
                      : 'No recordings match your search.'}
                  </AppText>
                ) : (
                  filteredRecordings.map((item) => (
                    <RecordingCard
                      key={item.id}
                      tags={item.tags ?? ['Sexism']}
                      title={item.title}
                      location={item.location}
                      date={item.date}
                      timestamp={item.timestamp}
                      duration={item.durationLabel}
                      onDetailsPress={() => onRecording(item)}
                    />
                  ))
                )}
              </>
            ) : (
              <>
                {filteredReports.length === 0 ? (
                  <AppText style={styles.emptyState}>
                    {reports.length === 0
                      ? 'You have not generated any reports yet.'
                      : 'No reports match your search.'}
                  </AppText>
                ) : (
                  filteredReports.map((item) => (
                    <ReportCard
                      key={item.id}
                      tags={item.tags ?? ['Sexism']}
                      title={item.title}
                      location={item.location}
                      excerpt={item.excerpt}
                      onDetailsPress={() => onReportDetails(item)}
                      status={item.status}
                      date={item.date}
                      timestamp={item.timestamp}
                    />
                  ))
                )}
              </>
            )}
          </View>
        </ScrollView>
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
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    gap: 24,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  contentContainer: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 16,
  },
  searchSettings: {
    marginBottom: 8,
  },
  tabContainer: {
    marginBottom: 16,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#cfcfcfff',
    padding: 16,
  },
  modalTitle: {
    textAlign: 'center',
    color: '#000',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    marginBottom: 16,
    borderColor: '#ccc',
  },
  modalButtonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  confirmButtonDisabled: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  confirmButtonEnabled: {
    flex: 1,
    height: 48,
    borderRadius: 12,
  },
  cancelButtonStyle: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonDisabledStyle: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#8A8A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabledText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonEnabledStyle: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonEnabledText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  openModalText: {
    color: '#000',
  },
  emptyState: {
    color: '#FFFFFF',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
