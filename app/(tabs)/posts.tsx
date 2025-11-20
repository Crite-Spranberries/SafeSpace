import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { StyleSheet, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchSettings from '@/components/ui/SearchSettings';
import ReportCard from '@/components/ui/ReportCard';
import SortButton, { SortOrder } from '@/components/ui/SortButton';
import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';

type PostItem = {
  id: string;
  tags: string[];
  title: string;
  location: string;
  excerpt: string;
  date: string;
  timestamp: string;
};

const POSTS: PostItem[] = [
  {
    id: '1',
    tags: ['Discrimination'],
    title: 'Homophobic Behavior On Site',
    location: '123 Granville St, Burnaby, BC',
    excerpt:
      'I want to share my personal experience on the site regarding homophobic behavior that I witnessed firsthand. While working, I noticed that certain individuals made inappropriate comments about people’s sexual orientation.',
    date: 'November 10, 2025',
    timestamp: '9:30',
  },
  {
    id: '2',
    tags: ['Discrimination'],
    title: 'Hostile Colleague',
    location: '123 Granville St, Burnaby, BC',
    excerpt:
      'I think it’s important to share this experience so that others are aware that hostile behavior in the workplace is real and can impact mental health. If you are experiencing something similar',
    date: 'May 6, 2023',
    timestamp: '8:30',
  },
  {
    id: '3',
    tags: ['Discrimination'],
    title: 'Sexist Comments by Coworker',
    location: '123 Granville St, Burnaby, BC',
    excerpt:
      'During recent meetings and casual conversations, this colleague made several remarks that were inappropriate and clearly gender-biased.',
    date: 'January 7, 2024',
    timestamp: '10:30',
  },
  {
    id: '4',
    tags: ['Discrimination'],
    title: 'Rude Supervisor on Site #5',
    location: '123 Granville St, Burnaby, BC',
    excerpt:
      'During recent meetings and casual conversations, this colleague made several remarks that were inappropriate and clearly gender-biased.',
    date: 'March 7, 2024',
    timestamp: '10:30',
  },
];

// Robust parser for strings like "January 7, 2024" and time like "10:30".
function parseDateTime(dateStr: string, timeStr: string) {
  const monthMap: Record<string, number> = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const m = dateStr.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return NaN;
  const monthName = m[1];
  const day = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const month = monthMap[monthName] ?? 0;

  let hour = 0;
  let minute = 0;
  const tm = String(timeStr).match(/(\d{1,2}):(\d{2})/);
  if (tm) {
    hour = parseInt(tm[1], 10);
    minute = parseInt(tm[2], 10);
  }

  return new Date(year, month, day, hour, minute).getTime();
}

export default function Profile() {
  const router = useRouter();
  const onDetails = () => {
    router.push('/recording_sandbox/report');
  };

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const posts = useMemo(() => {
    return [...POSTS].sort((a, b) => {
      const dateA = parseDateTime(a.date, a.timestamp) || 0;
      const dateB = parseDateTime(b.date, b.timestamp) || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [sortOrder]);

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.buttonContainer}>
          <Button
            variant="purple"
            radius="full"
            className="h-[52px] px-[20px]"
            onPress={() => router.push('/create_report')}>
            <Icon as={Plus} size={24} color="#fff" />
            <AppText weight="medium" style={styles.buttonText}>
              Create Report
            </AppText>
          </Button>
        </View>
        <View style={styles.header}>
          <AppText weight="bold" style={styles.pageTitle}>
            Posted Reports
          </AppText>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 76 }}>
          <View style={styles.contentContainer}>
            <SearchSettings />
            <SortButton value={sortOrder} onChange={setSortOrder} />
            {posts.map((p) => (
              <ReportCard
                key={p.id}
                tags={p.tags}
                title={p.title}
                location={p.location}
                excerpt={p.excerpt}
                onDetailsPress={onDetails}
                date={p.date}
                timestamp={p.timestamp}
              />
            ))}
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
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 26,
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
});
