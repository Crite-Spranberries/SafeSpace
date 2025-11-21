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
  const [address, setAddress] = React.useState<string | null>(null);

  const onDetails = () => {
    router.push('/create_report/report');
  };

  return (
    <View style={{ flex: 1 }}>
      <MapOnHome style={StyleSheet.absoluteFill} onAddressChange={setAddress} />

      {/* Overlay all UI on top of the map with absolute positioning */}
      <SafeAreaView
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
        pointerEvents="box-none">
        {/* Combined top bar container */}
        <View style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 10 }}>
          <HomeTopBar
            onPressNotifications={() => console.log('Notify')}
            onPressHelp={() => console.log('Help')}
            glass
            borderColor="rgba(255,255,255,0.5)"
            borderWidth={1}
            radius={24}
          />
          {address && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderRadius: 18,
                paddingVertical: 12,
                paddingHorizontal: 16,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 7,
                elevation: 3,
              }}>
              <AppText style={{ color: '#000', fontSize: 16, lineHeight: 20 }}>{address}</AppText>
            </View>
          )}
        </View>

        {/* Bottom aligned "Create Report" button */}
        <View
          style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 40 }}
          pointerEvents="auto">
          <Button
            radius="full"
            style={{
              width: '90%',
              minHeight: 56,
              paddingVertical: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={onDetails}>
            <AppText
              style={{ fontSize: 20, lineHeight: 24, textAlignVertical: 'center' }}
              weight="medium">
              Create Report
            </AppText>
          </Button>
        </View>
      </SafeAreaView>
    </View>
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
