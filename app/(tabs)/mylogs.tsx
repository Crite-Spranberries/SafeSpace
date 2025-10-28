import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import RecordingCard from '@/components/ui/RecordingCard';
import ReportCard from '@/components/ui/ReportCard';
import SearchSettings from '@/components/ui/searchSettings';
import Tabs from '@/components/ui/tabs';
import { useRouter } from 'expo-router';

export default function RecordingsPage() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'recordings' | 'reports'>('recordings');
  const router = useRouter();

  const handleTabChange = (tab: 'recordings' | 'reports') => {
    setActiveTab(tab);
  };

  const onDetails = () => {
    router.push('/recording_sandbox/report');
  };

  const onRecording = () => {
    router.push('/recording_sandbox/details');
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 70, paddingBottom: 5 }}
          scrollEnabled={scrollEnabled}>
          <Tabs onTabChange={handleTabChange} tab={activeTab} style={{ marginBottom: 16 }} />
          <SearchSettings />
          <View style={styles.pageContainer}>
            {activeTab === 'recordings' ? (
              <>
                <RecordingCard
                  tags={['Pay Gap', 'Workplace Equality']}
                  title="Talking About the Pay Gap"
                  location="9200 Kingsway, Burnaby, BC"
                  timestamp="2025.01.07 15:30"
                  duration="6:12"
                  onDragChange={(dragging) => setScrollEnabled(!dragging)}
                  onDetailsPress={onRecording}
                />
                <RecordingCard
                  tags={['Workplace Harassment', 'Workplace Equality']}
                  title="Uncomfortable Comments at Work"
                  location="8200 Kingsway, Burnaby, BC"
                  timestamp="2025.01.07 15:30"
                  duration="6:12"
                  onDragChange={(dragging) => setScrollEnabled(!dragging)}
                  onDetailsPress={onRecording}
                />
                <RecordingCard
                  tags={['Misgendering', 'Workplace Equality']}
                  title="My Supervisor Keeps Misgendering Me"
                  location="6200 Kingsway, Burnaby, BC"
                  timestamp="2025.01.07 15:30"
                  duration="6:12"
                  onDragChange={(dragging) => setScrollEnabled(!dragging)}
                  onDetailsPress={onRecording}
                />
                <RecordingCard
                  tags={['Exclusion', 'Workplace Equality']}
                  title="Left Out Again"
                  location="3200 Kingsway, Burnaby, BC"
                  timestamp="2025.01.07 15:30"
                  duration="6:12"
                  onDragChange={(dragging) => setScrollEnabled(!dragging)}
                  onDetailsPress={onRecording}
                />
                <RecordingCard
                  tags={['Lack of Response', 'Workplace Equality']}
                  title="Still No Response from HR"
                  location="5200 Kingsway, Burnaby, BC"
                  timestamp="2025.01.07 15:30"
                  duration="6:12"
                  onDragChange={(dragging) => setScrollEnabled(!dragging)}
                  onDetailsPress={onRecording}
                />
              </>
            ) : (
              <>
                <ReportCard
                  tags={['Discrimination', 'Pay Inequality']}
                  title="Unequal Pay for Equal Work"
                  location="456 Government St, Burnaby, BC"
                  excerpt="I noticed that my male colleagues receive higher pay for the same tasks. When I raised the issue, I was ignored and sometimes subtly threatened. It made me feel undervalued and hesitant to speak up again."
                  likes={108}
                  comments={56}
                  onDetailsPress={onDetails}
                />
                <ReportCard
                  tags={['Discrimination', 'Harassment']}
                  title="Misgendered During Training"
                  location="123 Granville St, Burnaby, BC"
                  excerpt="During a recent apprenticeship training, my supervisor repeatedly referred to me with the wrong pronouns despite me correcting them multiple times."
                  likes={42}
                  comments={16}
                  onDetailsPress={onDetails}
                />
                <ReportCard
                  tags={['Discrimination', 'Safety']}
                  title="Unsafe Equipment Access"
                  location="789 Bernard Ave, Burnaby, BC"
                  excerpt="The workshop layout makes it unsafe for me as a non-binary person to access certain machinery without constant supervision, which is stressful and humiliating."
                  likes={37}
                  comments={27}
                  onDetailsPress={onDetails}
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
  pageContainer: {
    padding: 16,
    flexDirection: 'column',
    gap: 16,
  },
  tabContainer: {
    marginBottom: 16,
  },
});
