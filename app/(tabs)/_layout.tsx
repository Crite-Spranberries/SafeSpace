import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { House, Newspaper, CircleUserRound, FolderLock, Map, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { RecordingTabButton } from '@/components/RecordingTabButton';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticTab } from '@/components/HapticTab';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: '#B0B0B0',
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopEndRadius: 24,
            borderTopStartRadius: 24,
            paddingTop: 8,
            height: 98,
          },
          animation: 'shift',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => <Icon as={Map} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="posts"
          options={{
            title: 'Posts',
            tabBarIcon: ({ color }) => <Icon as={Newspaper} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="recording"
          options={{
            tabBarButton: RecordingTabButton,
          }}
        />
        <Tabs.Screen
          name="myLogs"
          options={{
            title: 'My Logs',
            tabBarIcon: ({ color }) => <Icon as={FolderLock} size={24} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Icon as={Settings} size={24} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  recording: {
    backgroundColor: '#8449DF',
    borderRadius: 32,
    padding: 16,
    color: '#fff',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
});
