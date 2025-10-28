import { View } from 'react-native';
import { Text } from './text';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from './button';

type TabsProps = {
  onTabChange: (tab: 'recordings' | 'reports') => void;
  tab: 'recordings' | 'reports';
  style?: ViewStyle;
};

export default function Tabs({ onTabChange, tab, style }: TabsProps) {
  return (
    <>
      <View style={[styles.tabContainer, style]}>
        <Button
          variant={tab === 'recordings' ? 'switch' : 'ghost'}
          onPress={() => onTabChange('recordings')}
          radius="full"
          style={styles.buttonWrapper}>
          <Text style={tab === 'recordings' ? styles.activeText : styles.inactiveText}>
            Recordings
          </Text>
        </Button>
        <Button
          variant={tab === 'reports' ? 'switch' : 'ghost'}
          onPress={() => onTabChange('reports')}
          radius="full"
          style={styles.buttonWrapper}>
          <Text style={tab === 'reports' ? styles.activeText : styles.inactiveText}>Reports</Text>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
    marginHorizontal: 16,
    height: 50,
    backgroundColor: '#ffffff30',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    color: '#000',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#fff',
  },
  buttonWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
