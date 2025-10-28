import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Input } from './input';
import { Badge } from './badge';
import { Button } from './button';
import { Text } from './text';
import { Icon } from './icon';
import { Search, Settings2 } from 'lucide-react-native';

export default function SearchSettings() {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Icon as={Search} color="#7842CB" size={24} />
        <Input
          placeholder="Search by keyword or tags..."
          style={styles.input}
          placeholderTextColor="#6B6B6B"
        />
      </View>

      <View style={styles.badgeContainer}>
        <Button size="iconSmall" radius="full">
          <Icon as={Settings2} color="#7842CB" size={24} />
        </Button>
        <Badge variant="darkGrey" className="px-4">
          <Text style={styles.badgeText}>Oakridge</Text>
        </Badge>
        <Badge variant="darkGrey" className="px-4">
          <Text style={styles.badgeText}>Downtown</Text>
        </Badge>
        <Badge variant="darkGrey" className="px-4">
          <Text style={styles.badgeText}>Marine Drive</Text>
        </Badge>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 0,
    shadowColor: 'transparent',
    width: '90%',
    color: '#000',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 10,
  },

  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'nowrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
