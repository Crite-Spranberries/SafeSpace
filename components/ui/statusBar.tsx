import { View } from 'react-native';
import { StyleSheet, Pressable } from 'react-native';

type StatusBarProps = {
  state: number;
  onPageSelect?: (page: number) => void;
};

export default function StatusBar({ state, onPageSelect }: StatusBarProps) {
  return (
    <>
      <View style={styles.barContainer}>
        <Pressable onPress={() => onPageSelect?.(1)} style={{ flex: 1, height: 12 }}>
          <View style={state === 1 ? styles.selectedBar : styles.unselectedBar} />
        </Pressable>
        <Pressable onPress={() => onPageSelect?.(2)} style={{ flex: 1, height: 12 }}>
          <View style={state === 2 ? styles.selectedBar : styles.unselectedBar} />
        </Pressable>
        <Pressable onPress={() => onPageSelect?.(3)} style={{ flex: 1, height: 12 }}>
          <View style={state === 3 ? styles.selectedBar : styles.unselectedBar} />
        </Pressable>
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
