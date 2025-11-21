import React, { useCallback, useEffect, useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Easing } from 'react-native';
import { AppText } from '@/components/ui/AppText';

export default function RoundRecordingButton({ isRecording = false, onStart, onStop }) {
  const handlePress = useCallback(() => {
    if (isRecording) {
      onStop && onStop();
    } else {
      onStart && onStart();
    }
  }, [isRecording, onStart, onStop]);

  // Animated progress: 0 => start circle, 1 => stop square
  const progress = useRef(new Animated.Value(isRecording ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isRecording ? 1 : 0,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isRecording, progress]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
        onPress={handlePress}
        style={styles.outerCircle}>
        <Animated.View
          accessible={false}
          style={[
            styles.innerBase,
            {
              width: progress.interpolate({ inputRange: [0, 1], outputRange: [70, 40] }),
              height: progress.interpolate({ inputRange: [0, 1], outputRange: [70, 40] }),
              borderRadius: progress.interpolate({ inputRange: [0, 1], outputRange: [999, 8] }),
              backgroundColor: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['#FF5656', '#9D6DE5'],
              }),
            },
          ]}
        />
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
  innerBase: {
    alignSelf: 'center',
  },
  label: {
    marginTop: 14,
    fontSize: 20,
    lineHeight: 24,
    color: '#FFFFFF',
  },
});
