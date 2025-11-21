import { View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';

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
          <AppText
            weight="medium"
            style={tab === 'recordings' ? styles.activeText : styles.inactiveText}>
            Recordings
          </AppText>
        </Button>
        <Button
          variant={tab === 'reports' ? 'switch' : 'ghost'}
          onPress={() => onTabChange('reports')}
          radius="full"
          style={styles.buttonWrapper}>
          <AppText
            weight="medium"
            style={tab === 'reports' ? styles.activeText : styles.inactiveText}>
            Reports
          </AppText>
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
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    fontSize: 16,
    lineHeight: 20,
  },
  inactiveText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  buttonWrapper: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
