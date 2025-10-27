import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useNavigation } from 'expo-router';
import { Input } from '@/components/ui/input';
import StatusBar from '@/components/ui/statusBar';

export default function Form() {
  const navigation = useNavigation();
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} style={styles.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.pageContainer}>
        <View style={{ gap: 16 }}>
          <StatusBar state={1} />
          <Text variant="h3" style={{ textAlign: 'center', marginBottom: 8 }}>
            General Information
          </Text>
          <View>
            <Text>Location</Text>
            <Input placeholder="Location" style={styles.input} placeholderTextColor="#6B6B6B" />
          </View>
          <View>
            <Text>Date and Time</Text>
            <Input
              placeholder="Date and Time"
              style={styles.input}
              placeholderTextColor="#6B6B6B"
            />
          </View>
          <View>
            <Text>Trades Field</Text>
            <Input placeholder="Trades Field" style={styles.input} placeholderTextColor="#6B6B6B" />
          </View>

          <Text>Type of Report</Text>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button variant="darkGrey" style={{ flex: 1, marginRight: 8 }}>
                <Text>Harassment</Text>
              </Button>
              <Button variant="darkGrey" style={{ flex: 1 }}>
                <Text>Safety Hazards</Text>
              </Button>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Button variant="darkGrey" style={{ flex: 1, marginRight: 8 }}>
                <Text>Discrimination</Text>
              </Button>
              <Button variant="darkGrey" style={{ flex: 1 }}>
                <Text>Violence</Text>
              </Button>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            variant="darkGrey"
            size="lg"
            radius="full"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}>
            <Text>Back</Text>
          </Button>
          <Button variant="purple" size="lg" radius="full" style={{ flex: 1 }}>
            <Text>Next</Text>
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
  pageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  input: {
    backgroundColor: 'white',
  },
});
