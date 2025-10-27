import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, ImageBackground, type ImageStyle, View } from 'react-native';
import { StyleSheet, ScrollView } from 'react-native';
import MapOnHome from '@/components/ui/MapOnHome';
import ReportCard from '@/components/ui/ReportCard';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Details from '../recording_sandbox/details';
import Recording from './recording';
import { AppText } from '@/components/ui/AppText';
import HomeTopBar from '@/components/ui/HomeTopBar';

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
  const tags = ['Tag name 1', 'Tag name 2'];
  const onDetails = () => {
    // handle details button pressed
  };
  // background: linear-gradient(180deg, #371F5E 0%, #000 30.29%);
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 60, left: 0, right: 0, zIndex: 10 }}>
          <HomeTopBar />
        </View>
        <ScrollView contentContainerStyle={{ paddingTop: 70 }}>
          <View style={styles.pageContainer}>
            <View className="w-full max-w-md">
              <MapOnHome />
            </View>
            <Link href="../create_report" asChild>
              <Button radius="full" className="h-[52px]">
                <AppText style={{ fontSize: 20, lineHeight: 24 }} weight="medium">
                  Create Report
                </AppText>
              </Button>
            </Link>
            <AppText style={styles.reportSectionHeader} weight="bold">
              Reports Near You
            </AppText>
            <ReportCard
              tags={tags}
              title="Title generated based on summary"
              location="123 Location Street, Vancouver"
              excerpt="AI Summary Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in."
              likes={67}
              comments={67}
              onDetailsPress={onDetails}
            />
            <ReportCard
              tags={tags}
              title="Title generated based on summary"
              location="123 Location Street, Vancouver"
              excerpt="AI Summary Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in."
              likes={67}
              comments={67}
              onDetailsPress={onDetails}
            />
            <ReportCard
              tags={tags}
              title="Title generated based on summary"
              location="123 Location Street, Vancouver"
              excerpt="AI Summary Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in."
              likes={67}
              comments={67}
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
    gap: 16,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  reportSectionHeader: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
