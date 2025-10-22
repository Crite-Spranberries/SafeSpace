import { Text } from '@/components/ui/text';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { View } from 'react-native';

export default function Profile() {
  return (
    <View className="flex-1 items-center justify-start p-4">
      <Text className="mb-4">Posts</Text>
      <View className="w-full max-w-md">
        <MapOnDetail />
      </View>
    </View>
  );
}
