import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { House, Newspaper, CircleUserRound, FolderLock, AudioLines } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { RecordingTabButton } from '@/components/recordingTabButton';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: '#B0B0B0',
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
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon as={House} size={24} color={color} />,
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
        name="mylogs"
        options={{
          title: 'My Logs',
          tabBarIcon: ({ color }) => <Icon as={FolderLock} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon as={CircleUserRound} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  recording: {
    backgroundColor: '#8449DF',
    borderRadius: 32,
    padding: 16,
    color: '#fff',
  },
});
