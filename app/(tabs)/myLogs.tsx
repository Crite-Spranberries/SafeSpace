import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';
import ReportCard from '@/components/ui/ReportCard';
import SearchSettings from '@/components/ui/SearchSettings';
import Tabs from '@/components/ui/Tabs';
import { useRouter, useFocusEffect } from 'expo-router';
import { Modal } from '@/components/ui/Modal';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import * as Haptics from 'expo-haptics';
import { AppText } from '@/components/ui/AppText';
import { loadRecordings, StoredRecording } from '@/lib/recordings';

export default function MylogsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recordings' | 'reports'>('recordings');
  const [password, setPassword] = useState('');
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setModalOpen(true);
      (async () => {
        try {
          const saved = await loadRecordings();
          if (isActive) {
            setRecordings(saved);
          }
        } catch (err) {
          console.warn('Failed to load recordings', err);
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

  const onDetails = () => {
    router.push('/my_logs/myPostDetails');
  };

  const onRecording = (recording: StoredRecording) => {
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
      },
    });
  };

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
            <SearchSettings style={styles.searchSettings} />
            {activeTab === 'recordings' ? (
              <>
                {recordings.length === 0 ? (
                  <AppText style={styles.emptyState}>
                    You have not saved any recordings yet. Start a recording to see it listed here.
                  </AppText>
                ) : (
                  recordings.map((item) => (
                    <RecordingCard
                      key={item.id}
                      tags={item.tags ?? ['Recorded']}
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
                <ReportCard
                  tags={['Discrimination', 'Pay Inequality']}
                  title="Unequal Pay for Equal Work"
                  location="456 Government St, Burnaby, BC"
                  excerpt="I noticed that my male colleagues receive higher pay for the same tasks. When I raised the issue, I was ignored and sometimes subtly threatened. It made me feel undervalued and hesitant to speak up again."
                  onDetailsPress={onDetails}
                  status="Posted"
                  date="November 6, 2025"
                  timestamp="10:30"
                />
                <ReportCard
                  tags={['Discrimination', 'Harassment']}
                  title="Misgendered During Training"
                  location="123 Granville St, Burnaby, BC"
                  excerpt="During a recent apprenticeship training, my supervisor repeatedly referred to me with the wrong pronouns despite me correcting them multiple times."
                  onDetailsPress={onDetails}
                  status="Private"
                  date="January 7, 2025"
                  timestamp="10:30"
                />
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
