import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { ChevronDown } from 'lucide-react-native';
import { ChevronUp } from 'lucide-react-native';
import { AppText } from './AppText';

export type SortOrder = 'newest' | 'oldest';

type Props = {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
  style?: StyleProp<ViewStyle>;
};

export default function SortButton({ value, onChange, style }: Props) {
  const label = value === 'newest' ? 'Newest' : 'Oldest';

  const handleToggle = () => {
    onChange(value === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <View style={[styles.container, style] as any}>
      <Pressable style={styles.button} onPress={handleToggle}>
        <AppText weight="medium" style={styles.label}>
          Sort by: {label}
        </AppText>
        <Icon as={value === 'newest' ? ChevronDown : ChevronUp} size={18} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-end',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
});
