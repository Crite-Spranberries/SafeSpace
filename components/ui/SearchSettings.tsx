import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Input } from './Input';
import { Icon } from './Icon';
import { Search } from 'lucide-react-native';

type SearchSettingsProps = {
  style?: StyleProp<ViewStyle>;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

export default function SearchSettings({
  style,
  value,
  onChangeText,
  placeholder = 'Search by keyword or tags...',
}: SearchSettingsProps) {
  return (
    <View style={[styles.searchBar, style]}>
      <Icon as={Search} color="#7842CB" size={24} />
      <Input
        placeholder={placeholder}
        style={styles.input}
        placeholderTextColor="#6B6B6B"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 12,
    height: 50,
    borderRadius: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 0,
    shadowColor: 'transparent',
    width: '90%',
    color: '#000',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Satoshi-regular',
  },
});
