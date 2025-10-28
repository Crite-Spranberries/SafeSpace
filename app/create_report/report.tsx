import { TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
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
            <Text variant="h2" style={styles.title}>
              Onsite Harassment Concern Near Coffee Bar
            </Text>
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <Text style={styles.subHeader}>Tags</Text>
            <View className="mb-4 flex flex-row gap-2 space-x-2">
              <Badge variant="lightGrey">
                <Text>Harassment</Text>
              </Badge>
              <Badge variant="lightGrey">
                <Text>Site Safety</Text>
              </Badge>
            </View>
            <Text style={styles.subHeader}>Summary</Text>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderColor: '#fff',
                borderWidth: 1,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
              <Text style={styles.descriptionBlack}>
                In the past week, a male individual was observed frequently interacting in ways that
                have made several tradeswomen uncomfortable. The individual is described as having
                brunette, curly hair, approximately 180 cm tall, and often seen near the coffee bar
                area.
              </Text>
            </View>

            <Button variant="outline" size="lg" radius="lg">
              <Text>Load More</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    // marginBottom: 8,
    marginTop: 24,
    borderColor: 'transparent',
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
});
