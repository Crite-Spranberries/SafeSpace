import { TouchableOpacity, View } from 'react-native';
// replaced Text usages below with AppText
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { router, Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { useNavigation } from 'expo-router';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/badge';
import { ScrollView } from 'react-native';
import CommentCard from '@/components/ui/CommentCardN';
import { AppText } from '@/components/ui/AppText';

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
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <AppText style={styles.subHeader}>Tags</AppText>
            <View className="mb-4 flex flex-row gap-2 space-x-2">
              <Badge variant="lightGrey">
                <AppText>Harassment</AppText>
              </Badge>
              <Badge variant="lightGrey">
                <AppText>Site Safety</AppText>
              </Badge>
            </View>
            <AppText style={styles.subHeader}>Summary</AppText>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderColor: '#fff',
                borderWidth: 1,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
              <AppText style={styles.descriptionBlack}>
                In the past week, a male individual was observed frequently interacting in ways that
                have made several tradeswomen uncomfortable. The individual is described as having
                brunette, curly hair, approximately 180 cm tall, and often seen near the coffee bar
                area.
              </AppText>
            </View>
            <View style={styles.commentsSection}>
              <AppText style={styles.subHeader} weight="medium">
                Comments
              </AppText>
              <CommentCard
                excerpt="Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in."
                likes={5}
                comments={2}
              />
            </View>
            <Button variant="outline" size="lg" radius="lg">
              <AppText style={{ color: '#FFFFFF' }}>Load More</AppText>
            </Button>
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
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 10,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
    color: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    // marginBottom: 8,
    marginTop: 24,
    borderColor: 'transparent',
    color: '#FFF',
  },
  descriptionBlack: {
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '400',
    color: '#000',
  },
  descriptionWhite: {
    fontSize: 16,
    marginBottom: 16,
    color: '#fff',
  },
  commentsSection: {
    marginBottom: 16,
  },
});
