import { Icon } from '@/components/ui/icon';
import { AudioLines } from 'lucide-react-native';
import { Link } from 'expo-router';

import { StyleSheet, TouchableOpacity } from 'react-native';

export const RecordingTabButton = () => {
  const handlePress = () => {
    // Handle the button press action
  };

  return (
    <Link href="/(tabs)/recording" style={styles.button}>
      <Icon as={AudioLines} size={24} color={'#fff'} />
    </Link>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    // transform: [{ translateX: -30 }],
    backgroundColor: '#7842CB',
    borderRadius: 999,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
