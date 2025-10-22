import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/card';
import MapOnDetail from '@/components/ui/MapOnDetail';

export default function Profile() {
  const tags = ['Tag #1', 'Tag #2'];
  const onDetails = () => {
    // handle details button pressed
  };

  return (
    <View style={styles.pageContainer}>
      <Text>WIP.</Text>
      <Text className="mb-4">Posts</Text>
      <View className="w-full max-w-md">
        <MapOnDetail />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    margin: 10,
    flexDirection: 'column',
    alignContent: 'center',
    gap: 24,
  },
});
