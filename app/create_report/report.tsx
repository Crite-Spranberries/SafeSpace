import { TouchableOpacity, View } from 'react-native';
// replaced Text usages below with AppText
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useNavigation } from 'expo-router';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { ScrollView } from 'react-native';
import CommentCard from '@/components/ui/CommentCardN';
import { AppText } from '@/components/ui/AppText';
import Recommendation from '@/components/ui/Recommendation';

const SCREEN_OPTIONS = {
  title: '',
  headerBackTitle: 'Back',
  headerTransparent: true,
  headerLeft: () => (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Icon as={ArrowLeft} size={24} />
    </TouchableOpacity>
  ),
};

export default function Report() {
  const navigation = useNavigation();

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <AppText weight="medium" style={styles.title}>
              Onsite Harassment Concern Near Coffee Bar
            </AppText>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <AppText style={styles.descriptionWhite}>November 4, 2025</AppText>
              <AppText style={styles.descriptionWhite}>10:15 AM</AppText>
            </View>
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Type of Report
              </AppText>
              <View className="mb-4 flex flex-row gap-2 space-x-2">
                <Badge variant="darkGrey">
                  <AppText style={styles.badgeText}>Harassment</AppText>
                </Badge>
                <Badge variant="darkGrey">
                  <AppText style={styles.badgeText}>Verbal</AppText>
                </Badge>
              </View>
            </View>
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Trades Field
              </AppText>
              <View className="mb-4 flex flex-row gap-2 space-x-2">
                <Badge variant="darkGrey">
                  <AppText style={styles.badgeText}>Electrical</AppText>
                </Badge>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText weight="medium" style={styles.subHeader}>
                  AI Summary
                </AppText>
                <AppText style={{ color: '#B0B0B0' }}>GPT-4o</AppText>
              </View>

              <AppText style={styles.descriptionWhite}>
                In the past week, a male individual was observed frequently interacting in ways that
                have made several tradeswomen uncomfortable. The individual is described as having
                brunette, curly hair, approximately 180 cm tall, and often seen near the coffee bar
                area.
              </AppText>
            </View>

            <View style={styles.recommendationsSection}>
              <AppText weight="medium" style={styles.subHeader}>
                Recommended Actions
              </AppText>
              <Recommendation text="Provide Bystander Intervention and Respect Training" />
              <Recommendation text="Require Pre-Task Safety and Inclusion Briefings" />
              <Recommendation text="Implement a Zero-Tolerance Harassment Policy" />
              <Recommendation text="Enforce Proper PPE Usage at All Times" />
            </View>
          </View>
        </ScrollView>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 24, gap: 24 }}>
          <Button variant="reallyLightGrey" size="lg" radius="full" style={{ flex: 1 }}>
            <AppText weight="medium" style={{ color: '#5E349E', fontSize: 16 }}>
              Edit
            </AppText>
          </Button>
          <Button variant="purple" size="lg" radius="full" style={{ flex: 1 }}>
            <AppText weight="medium" style={{ color: '#FFFFFF', fontSize: 16 }}>
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
});
