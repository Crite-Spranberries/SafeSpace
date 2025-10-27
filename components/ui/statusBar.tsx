import { View } from 'react-native';
import { StyleSheet } from 'react-native';

type StatusBarProps = {
  state: number;
};

export default function StatusBar({ state }: StatusBarProps) {
  return (
    <>
      <View style={styles.barContainer}>
        <View style={state === 1 ? styles.selectedBar : styles.unselectedBar} />
        <View style={state === 2 ? styles.selectedBar : styles.unselectedBar} />
        <View style={state === 3 ? styles.selectedBar : styles.unselectedBar} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  unselectedBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 999,
  },
  selectedBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 999,
  },
});
