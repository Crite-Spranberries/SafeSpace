import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/badge';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const tags = ['Tag #1', 'Tag #2'];
  const onDetails = () => {
    // handle details button pressed
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.pageContainer}>
            <Text>Put Searchbar at top</Text>
            <Text>Put Filter/Chips here</Text>
            <Text>Put "Sort by" here</Text>
            <Text>Put Posted Report Card here</Text>
            <Text>Put Create Report Button at bottom</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    margin: 10,
    flexDirection: 'column',
    alignContent: 'center',
    gap: 24,
  },
  tagAlign: {
    alignContent: 'center',
    flexDirection: 'row',
    gap: 24,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
});
