import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const tags = ['Tag #1', 'Tag #2'];
  const onDetails = () => {
    // handle details button pressed
  };

  return (
    <ScrollView>
      <View style={styles.pageContainer}>
        <Text>Put Searchbar at top</Text>
        <Text>Put Filter/Chips here</Text>
        <Text>Put "Sort by" here</Text>
        <Text>Put Posted Report Card here</Text>
        <Text>Put Create Report Button at bottom</Text>
      </View>
    </ScrollView>
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
});
