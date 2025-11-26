import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, SunIcon, Plus, Locate } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native';
import MapOnHome from '@/components/ui/MapOnHome';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Text } from '@/components/ui/Text';
import HomeTopBar from '@/components/ui/HomeTopBar';
import { useRouter } from 'expo-router';

export default function Home() {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const [address, setAddress] = React.useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Ref for map actions
  const mapRef = React.useRef<any>(null);

  const onDetails = () => {
    router.push('/create_report');
  };

  const onCenterLocation = () => {
    mapRef.current?.centerOnUser();
  };

  return (
    <View style={{ flex: 1 }}>
      <MapOnHome ref={mapRef} style={StyleSheet.absoluteFill} onAddressChange={setAddress} />
      <SafeAreaView
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
        pointerEvents="box-none">
        <View
          style={{
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}>
          <HomeTopBar
            address={address}
            glass
            borderColor="rgba(255,255,255,0.5)"
            borderWidth={1}
            radius={24}
          />
          <Text variant="h4">Nearby Reports</Text>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 5,
            width: '100%',
          }}
          pointerEvents="auto">
          {/* Horizontal row above the button for card and location button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '90%',
              alignSelf: 'center',
              marginBottom: 16,
              minHeight: 56, // matches button height
            }}>
            {/* Placeholder for future card */}
            {/* <View style={{ flex: 1, marginRight: 12 }}>{middleCard}</View> */}

            {/* Center map button at end/right */}
            <Pressable
              onPress={onCenterLocation}
              style={{
                marginLeft: 'auto', // pushes to right edge
                backgroundColor: '#fff',
                padding: 14,
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 7,
                elevation: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Locate color="#8449DF" size={28} />
            </Pressable>
          </View>

          {/* Create Report button (remains centered at bottom) */}
          <Button
            radius="full"
            style={{
              width: '90%',
              minHeight: 56,
              paddingVertical: 16,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              alignSelf: 'center',
            }}
            onPress={onDetails}>
            <AppText
              style={{
                fontSize: 20,
                lineHeight: 24,
                textAlignVertical: 'center',
                fontWeight: '500',
                marginRight: 8,
              }}
              weight="medium">
              Create Report
            </AppText>
            <Plus color="#8449DF" size={28} />
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ...ThemeToggle and styles unchanged
