import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

export type WaveFormProps = {
  active?: boolean;
  width?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  updateInterval?: number;
  animationDuration?: number;
  minScale?: number;
  inactiveHeight?: number;
};

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 200;
const DEFAULT_BAR_WIDTH = 4;
const DEFAULT_GAP = 4;
const DEFAULT_MIN_SCALE = 0.1;
const DEFAULT_INACTIVE_HEIGHT = 1;

export default function WaveForm({
  active = false,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  barWidth = DEFAULT_BAR_WIDTH,
  gap = DEFAULT_GAP,
  color = '#FFFFFF',
  updateInterval = 400,
  animationDuration = 1000,
  minScale = DEFAULT_MIN_SCALE,
  inactiveHeight = DEFAULT_INACTIVE_HEIGHT,
}: WaveFormProps) {
  const barCount = useMemo(() => {
    const size = Math.max(12, Math.floor(width / (barWidth + gap)));
    return size;
  }, [width, barWidth, gap]);

  const baseScale = useMemo(() => {
    const desiredScale = inactiveHeight / height;
    return Math.max(minScale, desiredScale);
  }, [inactiveHeight, height, minScale]);

  const valuesRef = useRef<Animated.Value[]>([]);
  if (valuesRef.current.length !== barCount) {
    valuesRef.current = Array.from({ length: barCount }, () => new Animated.Value(baseScale));
  }

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animateToRandom = useCallback(() => {
    const animations = valuesRef.current.map((value) => {
      const target = baseScale + Math.random() * (1 - baseScale);
      return Animated.timing(value, {
        toValue: target,
        duration: animationDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });
    });

    Animated.parallel(animations, { stopTogether: false }).start();
  }, [animationDuration, baseScale]);

  const stopAndReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    Animated.parallel(
      valuesRef.current.map((value) =>
        Animated.timing(value, {
          toValue: baseScale,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [baseScale]);

  useEffect(() => {
    // ensure existing animated values reflect the latest base scale when props change
    valuesRef.current.forEach((value) => {
      value.setValue(baseScale);
    });
  }, [baseScale]);

  useEffect(() => {
    if (!active) {
      stopAndReset();
      return;
    }

    animateToRandom();
    intervalRef.current = setInterval(animateToRandom, updateInterval);

    return () => {
      stopAndReset();
    };
  }, [active, animateToRandom, stopAndReset, updateInterval]);

  
  return (
    <View style={[styles.container, { width, height }]}>
      {valuesRef.current.map((value, index) => {
        const opacity = active ? 1 : 0.8;
        return (
          <Animated.View
            key={index}
            style={{
              width: barWidth,
              marginRight: index === barCount - 1 ? 0 : gap,
              borderRadius: barWidth / 2,
              backgroundColor: color,
              alignSelf: 'flex-end',
              height,
              transform: [{ scaleY: value }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
