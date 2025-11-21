import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
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
import { useRouter } from 'expo-router';

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

export default function Home() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const onDetails = () => {
    router.push('/create_report/report');
  };
  // background: linear-gradient(180deg, #371F5E 0%, #000 30.29%);
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 10 }}>
          <HomeTopBar />
        </View>
        <ScrollView contentContainerStyle={{ paddingTop: 70, paddingBottom: 5 }}>
          <View style={styles.pageContainer}>
            <View className="w-full max-w-md">
              <MapOnHome />
            </View>
            <Link href="../create_report" asChild>
              <Button radius="full" className="mt-2 h-[52px]">
                <AppText style={{ fontSize: 20, lineHeight: 24 }} weight="medium">
                  Create Report
                </AppText>
              </Button>
            </Link>
            <AppText style={styles.reportSectionHeader} weight="bold">
              Reports Near You
            </AppText>
            <ReportCard
              tags={['Harassment', 'Site Safety']}
              title="Onsite Harassment Concern Near Coffee Bar"
              location="123 Construction Avenue, Vancouver"
              excerpt="In the past week, a male individual was observed frequently interacting in ways that have made several tradeswomen uncomfortable. The individual is described as having brunette, curly hair, approximately 180 cm tall, and often seen near the coffee bar area."
              onDetailsPress={onDetails}
            />
            <ReportCard
              tags={['Discrimination', 'Harassment']}
              title="Misgendered During Training"
              location="123 Granville St, Burnaby, BC"
              excerpt="During a recent apprenticeship training, my supervisor repeatedly referred to me with the wrong pronouns despite me correcting them multiple times."
              onDetailsPress={onDetails}
            />
            <ReportCard
              tags={['Discrimination', 'Safety']}
              title="Unsafe Equipment Access"
              location="789 Bernard Ave, Burnaby, BC"
              excerpt="The workshop layout makes it unsafe for me as a non-binary person to access certain machinery without constant supervision, which is stressful and humiliating."
              onDetailsPress={onDetails}
            />
            <Button variant="outline" className="h-[48px] rounded-[12px]">
              <AppText style={{ fontSize: 16, lineHeight: 20, color: '#FFFFFF' }} weight="medium">
                View More
              </AppText>
            </Button>
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
    padding: 16,
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
