import React, { useCallback } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { AppText } from '@/components/ui/AppText';

export default function RoundRecordingButton({ isRecording = false, onStart, onStop }) {
  const handlePress = useCallback(() => {
    if (isRecording) {
      onStop && onStop();
    } else {
      onStart && onStart();
    }
  }, [isRecording, onStart, onStop]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
        onPress={handlePress}
        style={styles.outerCircle}>
        {isRecording ? <View style={styles.stopSquare} /> : <View style={styles.startCircle} />}
      </TouchableOpacity>
      <AppText style={styles.label}>{isRecording ? 'Stop' : 'Start'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    width: 90,
    height: 90,
    borderRadius: 999,
    borderWidth: 4,
  },
  startCircle: {
    backgroundColor: '#FF5656',
    width: 70,
    height: 70,
    borderRadius: 999,
  },
  stopSquare: {
    backgroundColor: '#9D6DE5',
    width: 40,
    height: 40,
    borderRadius: 8,
    position: 'absolute',
  },
  label: {
    marginTop: 14,
    fontSize: 20,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
