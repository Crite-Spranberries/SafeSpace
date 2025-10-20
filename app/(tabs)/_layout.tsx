import { Tabs } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { House, Newspaper, CircleUserRound, FolderLock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: () => <Icon as={House} size={24} />,
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          tabBarIcon: () => <Icon as={Newspaper} size={24} />,
        }}
      />
      <Tabs.Screen
        name="mylogs"
        options={{
          title: 'My Logs',
          tabBarIcon: () => <Icon as={FolderLock} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Icon as={CircleUserRound} size={24} />,
        }}
      />
    </Tabs>
  );
}
