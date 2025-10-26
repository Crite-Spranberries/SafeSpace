import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, ImageBackground, type ImageStyle, View } from 'react-native';
import { StyleSheet, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const SCREEN_OPTIONS = {
  title: 'Home',
  headerTransparent: true,
  headerRight: () => <ThemeToggle />,
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();
  const tags = ['Tag #1', 'Tag #2'];
  const onDetails = () => {
    // handle details button pressed
  };
  // background: linear-gradient(180deg, #371F5E 0%, #000 30.29%);
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View style={styles.pageContainer}>
            <Text>Put top navigation notifs & help here</Text>
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <Link href="../create_report" asChild>
              <Button variant="default">
                <Text>Create Report</Text>
              </Button>
            </Link>
            <Text>Reports Near You</Text>
            <Card
              tags={tags}
              title="Title goes here"
              location="Location goes here"
              description="AI Description goes here"
              onDetailsPress={onDetails}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button
      onPressIn={toggleColorScheme}
      size="icon"
      variant="ghost"
      radius="full"
      className="ios:size-9 rounded-full web:mx-4">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    margin: 10,
    flexDirection: 'column',
    gap: 24,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
});
