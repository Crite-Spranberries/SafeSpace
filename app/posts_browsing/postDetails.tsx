import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import Recommendation from '@/components/ui/Recommendation';

export default function Details() {
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

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppText weight="bold" style={styles.title}>
              Title generated based on summary
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>November 4, 2025</AppText>
              <AppText style={styles.subtitleText}>10:15 AM</AppText>
            </View>
            <MapOnDetail address="3700 Willingdon Avenue, Burnaby" style={styles.mapOnDetail} />

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Type of Report
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Harassment
                  </AppText>
                </Badge>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Electrical
                  </AppText>
                </Badge>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Warning
                  </AppText>
                </Badge>
              </ScrollView>
            </View>

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Trades Field
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Badge variant="darkGrey" className="mr-2 px-4">
                  <AppText style={styles.badgeText} weight="medium">
                    Electrical
                  </AppText>
                </Badge>
              </ScrollView>
            </View>

            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <AppText style={styles.transcriptTitle} weight="medium">
                  AI Summary
                </AppText>
                <AppText style={styles.transcriptModel}>GPT-4o</AppText>
              </View>
              <AppText style={styles.transcriptText}>
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
                Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet
                pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis
                pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in.
              </AppText>
            </View>

            <View style={styles.recommendationsSection}>
              <AppText weight="medium" style={styles.recommendTitle}>
                Recommended Actions
              </AppText>
              <Recommendation text="Provide Bystander Intervention and Respect Training" />
              <Recommendation text="Require Pre-Task Safety and Inclusion Briefings" />
              <Recommendation text="Implement a Zero-Tolerance Harassment Policy" />
              <Recommendation text="Enforce Proper PPE Usage at All Times" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 35,
  },
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
  },
  title: {
    fontSize: 24,
    marginTop: 24,
    borderColor: 'transparent',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  subtitleText: {
    color: '#FFF',
    fontSize: 16,
  },
  badgeSection: {
    marginBottom: 24,
  },
  badgeTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  transcriptSection: {
    marginBottom: 24,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 20,
    color: '#fff',
  },
  transcriptModel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  transcriptText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  mapOnDetail: {
    marginBottom: 24,
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  recommendTitle: {
    fontSize: 20,
    color: '#fff',
  },
});
