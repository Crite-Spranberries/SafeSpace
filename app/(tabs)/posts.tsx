import { Link } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { StyleSheet, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchSettings from '@/components/ui/SearchSettings';
import ReportCard from '@/components/ui/ReportCard';
import SortButton, { SortOrder } from '@/components/ui/SortButton';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Plus } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import defaultPostsData from '@/assets/data/default_posts.json';
import { loadAllPublicReports, StoredReport } from '@/lib/reports';

type PostItem = {
  id: string;
  tags: string[];
  title: string;
  location: string;
  excerpt: string;
  date: string;
  timestamp: string;
  status?: 'Posted' | 'Private' | 'Draft';
  report_type?: string[];
  isUserReport?: boolean; // Flag to distinguish user reports from default posts
};

// Load posts from JSON file
const loadDefaultPosts = (): PostItem[] => {
  return defaultPostsData.map((post: any) => ({
    id: post.id,
    tags: post.report_type || post.tags || [],
    title: post.title,
    location: post.location,
    excerpt: post.excerpt,
    date: post.date,
    timestamp: post.timestamp,
    status: post.status || 'Posted',
    report_type: post.report_type || post.tags || [],
    isUserReport: false,
  }));
};

// Convert StoredReport to PostItem format
const convertReportToPostItem = (report: StoredReport): PostItem => {
  return {
    id: report.id,
    tags: report.report_type || report.tags || [],
    title: report.title,
    location: report.location || '',
    excerpt: report.excerpt || report.content || '',
    date: report.date,
    timestamp: report.timestamp,
    status: report.status,
    report_type: report.report_type || report.tags || [],
    isUserReport: true, // Mark as user report
  };
};

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

export default function Posts() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Load posts from both default posts and user's public reports
  const loadAllPosts = useCallback(async () => {
    try {
      const defaultPosts = loadDefaultPosts();
      const publicReports = await loadAllPublicReports();

      // Convert user reports to PostItem format
      const userPostItems = publicReports
        .filter((report) => {
          // Only include user reports (not default posts which are already loaded)
          return !report.id.startsWith('post-');
        })
        .map(convertReportToPostItem);

      // Combine default posts and user reports, deduplicate by id
      const combined = [...defaultPosts, ...userPostItems];
      const uniquePosts = combined.filter(
        (post, index, self) => index === self.findIndex((p) => p.id === post.id)
      );

      setPosts(uniquePosts);
    } catch (err) {
      console.warn('Failed to load posts', err);
      // Fallback to just default posts if loading fails
      setPosts(loadDefaultPosts());
    }
  }, []);

  // Load posts on mount and when page is focused
  useFocusEffect(
    useCallback(() => {
      loadAllPosts();
    }, [loadAllPosts])
  );

  const onDetails = (post: PostItem) => {
    // Navigate to appropriate detail page based on whether it's a user report
    if (post.isUserReport) {
      router.push({
        pathname: '/my_logs/myPostDetails',
        params: { id: post.id },
      });
    } else {
      router.push({
        pathname: '/posts_browsing/postDetails',
        params: { id: post.id },
      });
    }
  };

  // Filter posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      // Search in title
      if (post.title.toLowerCase().includes(query)) return true;

      // Search in excerpt
      if (post.excerpt?.toLowerCase().includes(query)) return true;

      // Search in location
      if (post.location?.toLowerCase().includes(query)) return true;

      // Search in tags (report_type)
      if (post.report_type?.some((tag) => tag.toLowerCase().includes(query))) return true;
      if (post.tags?.some((tag) => tag.toLowerCase().includes(query))) return true;

      return false;
    });
  }, [posts, searchQuery]);

  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      const dateA = parseDateTime(a.date, a.timestamp) || 0;
      const dateB = parseDateTime(b.date, b.timestamp) || 0;
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredPosts, sortOrder]);

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
            <SearchSettings value={searchQuery} onChangeText={setSearchQuery} />
            <SortButton value={sortOrder} onChange={setSortOrder} />
            {sortedPosts.map((p) => (
              <ReportCard
                key={p.id}
                tags={p.tags}
                title={p.title}
                location={p.location}
                excerpt={p.excerpt}
                onDetailsPress={() => onDetails(p)}
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
