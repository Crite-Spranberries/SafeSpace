import { Icon } from '@/components/ui/Icon';
import { AudioLines } from 'lucide-react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { StyleSheet, TouchableOpacity } from 'react-native';

export const RecordingTabButton = () => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Link href="/recording/recordingPage" style={styles.button} onPress={handlePress}>
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
