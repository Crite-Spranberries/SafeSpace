import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from 'expo-router';

export default function aiChat() {
  const navigation = useNavigation();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require('@/assets/images/safi-screenshot.png')}
        style={styles.background}
        resizeMode="cover">
        <View style={styles.header}>
          <Button variant="darkGrey" size="icon" radius="full" onPress={() => navigation.goBack()}>
            <Icon as={ArrowLeft} size={24} />
          </Button>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 10,
  },
});
