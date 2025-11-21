import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { StyleSheet, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <Text>WIP. The button below is for development use</Text>

          <View style={styles.clearButtonWrap}>
            <Button
              variant="destructive"
              radius="full"
              onPress={async () => {
                // confirm with the user
                const confirmed = await new Promise<boolean>((resolve) => {
                  Alert.alert(
                    'Clear All Stored Data?',
                    'This will remove all AsyncStorage data for the app. This action cannot be undone.',
                    [
                      { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                      { text: 'Clear', onPress: () => resolve(true), style: 'destructive' },
                    ],
                    { cancelable: true }
                  );
                });

                if (!confirmed) return;

                try {
                  await AsyncStorage.clear();
                  Alert.alert('Cleared', 'All stored data has been removed.');
                } catch (err) {
                  console.error('Failed to clear AsyncStorage', err);
                  Alert.alert('Error', 'Failed to clear stored data.');
                }
              }}>
              <Text style={{ color: 'white', fontSize: 18 }}>Clear All Local Data</Text>
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
  clearButtonWrap: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
});
