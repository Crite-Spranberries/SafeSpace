import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Input } from './Input';
import { Icon } from './Icon';
import { Search } from 'lucide-react-native';

type SearchSettingsProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SearchSettings({ style }: SearchSettingsProps) {
  return (
    <View style={[styles.searchBar, style]}>
      <Icon as={Search} color="#7842CB" size={24} />
      <Input
        placeholder="Search by keyword or tags..."
        style={styles.input}
        placeholderTextColor="#6B6B6B"
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
