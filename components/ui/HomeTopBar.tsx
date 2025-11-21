import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native'; // Paper plane/location icon

type HomeTopBarProps = ViewProps & {
  address?: string | null;
  className?: string;
  glass?: boolean;
  glassIntensity?: number; // blur intensity 0-100
  glassTint?: 'light' | 'dark' | 'default';
  glassBgAlpha?: number; // background alpha 0-1
  glossOpacity?: number; // overlay gloss opacity 0-1
  borderColor?: string;
  borderWidth?: number;
  radius?: number;
};

export function HomeTopBar({
  address,
  className,
  style,
  glass = true,
  glassIntensity = 8,
  glassTint = 'default',
  glassBgAlpha = 0.65, // Slightly stronger opaque
  glossOpacity = 0.15, // Slightly stronger gloss
  borderColor = 'rgba(255,255,255,0.0)',
  borderWidth = 0,
  radius = 28, // Bigger rounding
  ...rest
}: HomeTopBarProps) {
  let BlurViewComponent: any | undefined;
  if (glass) {
    try {
      BlurViewComponent = require('expo-blur').BlurView;
    } catch (e) {
      BlurViewComponent = undefined;
    }
  }

  const Container: any = glass && BlurViewComponent ? BlurViewComponent : View;
  const containerProps: any = { ...(rest as any) };
  if (Container !== View) {
    containerProps.intensity = glassIntensity;
    containerProps.tint = glassTint;
  }
  const bgColor = `rgba(255,255,255,${glassBgAlpha})`;

  return (
    <Container
      {...containerProps}
      pointerEvents="auto"
      className={cn('w-full flex-row items-center justify-center', className)} // px/padding handled in styles
      style={[
        style,
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth,
          borderRadius: radius,
        },
      ]}>
      {/* Glossy Overlay */}
      {glass ? (
        <LinearGradient
          colors={[
            `rgba(255,255,255,${glossOpacity})`,
            `rgba(255,255,255,${Math.max(0, glossOpacity - 0.12)})`,
          ]}
          start={[0, 0]}
          end={[0, 1]}
          style={[styles.gloss, { borderRadius: radius }]}
        />
      ) : null}
      {/* Icon + Text Row */}
      <View style={styles.row}>
        <Send color="#8449DF" size={28} style={styles.icon} />
        <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
          {address ?? 'Location unknown'}
        </Text>
      </View>
    </Container>
  );
}

export default HomeTopBar;

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    overflow: 'hidden',
    paddingHorizontal: 30, // Extra horizontal padding
    paddingVertical: 14, // Extra vertical padding
    minHeight: 56,
    justifyContent: 'center',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    position: 'absolute',
    borderRadius: 28,
    opacity: 0.85,
    pointerEvents: 'none',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    marginRight: 14,
    marginLeft: 2,
    alignSelf: 'center',
  },
  addressText: {
    fontSize: 20,
    color: '#222',
    fontWeight: '600',
    flexShrink: 1,
  },
});
