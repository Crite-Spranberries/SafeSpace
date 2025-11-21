import { AppText } from '@/components/ui/AppText';
import { StyleSheet, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Recording() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <AppText style={styles.pageTitle}>Blank Page</AppText>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 24,
    color: '#fff',
  },
});
