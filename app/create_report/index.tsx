import { Text } from '@/components/ui/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Stack } from 'expo-router';
import { useNavigation, useRouter } from 'expo-router';

export default function CreateReport() {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />

      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.pageContainer}>
        <View style={styles.header}>
          <Button variant="darkGrey" size="icon" radius="full" onPress={() => navigation.goBack()}>
            <Icon as={ArrowLeft} size={24} />
          </Button>
        </View>
        <View style={styles.contentContainer}>
          <Text variant="h3">Create Report</Text>
          <Text>
            Please ensure you are in a place of safety before continuing with your report.
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              size="multiLine"
              variant="darkGrey"
              radius="lg"
              style={styles.button}
              onPress={() => router.push('/create_report/aiChat')}>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>AI Guidance</Text>
                <Text style={styles.buttonDescription}>
                  Chat with our AI assistant Safi and she’ll turn your conversation into a report.
                </Text>
              </View>
              <Icon as={ArrowRight} size={24} />
            </Button>
            <Button
              size="multiLine"
              variant="darkGrey"
              radius="lg"
              onPress={() => router.push('/create_report/form')}
              style={styles.button}>
              <View style={styles.buttonText}>
                <Text style={styles.buttonTitle}>Do It Yourself</Text>
                <Text style={styles.buttonDescription}>
                  Manually input all the information needed to generate a report.
                </Text>
              </View>
              <Icon as={ArrowRight} size={24} />
            </Button>
          </View>
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
  pageContainer: {
    flex: 1,
    margin: 10,
    flexDirection: 'column',
    gap: 16,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 40,
  },
  buttonText: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  buttonTitle: {
    fontSize: 16,
  },
  buttonDescription: {
    fontSize: 14,
    fontWeight: '400',
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF80',
  },
});
