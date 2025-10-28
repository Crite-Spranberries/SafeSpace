import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, ScrollView } from 'react-native';
import RecordingCard from '@/components/ui/RecordingCard';
import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';

export default function MyLogs() {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 70, paddingBottom: 5 }}
          scrollEnabled={scrollEnabled}>
          <View style={styles.pageContainer}>
            <RecordingCard
              tags={['Pay Gap', 'Workplace Equality']}
              title="Talking About the Pay Gap"
              location="9200 Kingsway, Burnaby, BC"
              timestamp="2025.01.08 15:30"
              duration="6:12"
              onDragChange={(dragging) => setScrollEnabled(!dragging)}
            />
            <RecordingCard
              tags={['Workplace Harassment', 'Workplace Equality']}
              title="Uncomfortable Comments at Work"
              location="8200 Kingsway, Burnaby, BC"
              timestamp="2025.03.07 12:30"
              duration="6:12"
              onDragChange={(dragging) => setScrollEnabled(!dragging)}
            />
            <RecordingCard
              tags={['Misgendering', 'Workplace Equality']}
              title="My Supervisor Keeps Misgendering Me"
              location="6200 Kingsway, Burnaby, BC"
              timestamp="2025.04.09 10:30"
              duration="6:12"
              onDragChange={(dragging) => setScrollEnabled(!dragging)}
            />
            <RecordingCard
              tags={['Exclusion', 'Workplace Equality']}
              title="Left Out Again"
              location="3200 Kingsway, Burnaby, BC"
              timestamp="2025.01.07 8:30"
              duration="6:12"
              onDragChange={(dragging) => setScrollEnabled(!dragging)}
            />
            <RecordingCard
              tags={['Lack of Response', 'Workplace Equality']}
              title="Still No Response from HR"
              location="5200 Kingsway, Burnaby, BC"
              timestamp="2025.01.07 15:30"
              duration="6:12"
              onDragChange={(dragging) => setScrollEnabled(!dragging)}
            />
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
});
