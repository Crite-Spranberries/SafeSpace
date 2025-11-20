import { View } from 'react-native';
import { StyleSheet, ScrollView } from 'react-native';
import { Input } from './Input';
import { Badge } from './Badge';
import { Button } from './Button';
import { Text } from './Text';
import { Icon } from './Icon';
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeContainer}>
        <Button size="iconSmall" radius="full" className="mr-2">
          <Icon as={Settings2} color="#7842CB" size={24} />
        </Button>
        <Badge variant="darkGrey" className="mr-2 px-4">
          <Text style={styles.badgeText}>Oakridge</Text>
        </Badge>
        <Badge variant="darkGrey" className="mr-2 px-4">
          <Text style={styles.badgeText}>Downtown</Text>
        </Badge>
        <Badge variant="darkGrey" className="mr-2 px-4">
          <Text style={styles.badgeText}>Marine Drive</Text>
        </Badge>
      </ScrollView>
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
    // justifyContent: 'flex-start',
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
