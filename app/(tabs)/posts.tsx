import { Text } from '@/components/ui/Text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/badge';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchSettings from '@/components/ui/SearchSettings';
import ReportCard from '@/components/ui/ReportCard';
import { Icon } from '@/components/ui/icon';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();
  const tags = ['Tag #1', 'Tag #2'];
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const onDetails = () => {
    router.push('/recording_sandbox/report');
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.buttonContainer}>
          <Button
            variant="purple"
            radius="full"
            size="lg"
            onPress={() => router.push('/create_report')}>
            <Text>Create Report</Text>
            <Icon as={Plus} size={20} color="#fff" />
          </Button>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 5 }} scrollEnabled={scrollEnabled}>
          <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>
            Posted Reports
          </Text>
          <SearchSettings />
          <View style={styles.pageContainer}>
            <ReportCard
              tags={['Harassment', 'Site Safety']}
              title="Onsite Harassment Concern Near Coffee Bar"
              location="123 Construction Avenue, Vancouver"
              excerpt="In the past week, a male individual was observed frequently interacting in ways that have made several tradeswomen uncomfortable. The individual is described as having brunette, curly hair, approximately 180 cm tall, and often seen near the coffee bar area."
              likes={108}
              comments={56}
              onDetailsPress={onDetails}
            />
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    margin: 10,
    flexDirection: 'column',
    alignContent: 'center',
    gap: 24,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
});
