import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View, StyleSheet, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { Bell, CircleHelp } from 'lucide-react-native';

type HomeTopBarProps = ViewProps & {
  onPressNotifications?: () => void;
  onPressHelp?: () => void;
  showUnreadDot?: boolean;
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
  onPressNotifications,
  onPressHelp,
  showUnreadDot = true,
  className,
  style,
  glass = true,
  glassIntensity = 8,
  glassTint = 'default',
  glassBgAlpha = 0.6,
  glossOpacity = 0.1,
  borderColor = 'rgba(255,255,255,0.6)',
  borderWidth = 1,
  radius = 24,
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
      className={cn('w-full flex-row items-center justify-between px-4 py-3', className)}
      style={[
        style,
        styles.container,
        { backgroundColor: bgColor, borderColor, borderWidth, borderRadius: radius },
      ]}>
      {/* glossy overlay */}
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notifications"
        onPress={onPressNotifications}
        hitSlop={8}
        className="relative h-10 w-10 items-center justify-center rounded-full p-2">
        <Icon as={Bell} className="text-black" size={24} />
        {showUnreadDot ? (
          <View
            className="absolute h-2 w-2 rounded-full"
            style={{ backgroundColor: '#E06A36', left: 22, top: 12 }}
          />
        ) : null}
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Help"
        onPress={onPressHelp}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full p-2">
        <Icon as={CircleHelp} className="text-black" size={24} />
      </Pressable>
    </Container>
  );
}

export default HomeTopBar;

const styles = StyleSheet.create({
  container: {
    // Adjust these as needed for glass lift effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    overflow: 'hidden',
  },
  gloss: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    position: 'absolute',
    borderRadius: 24,
    opacity: 0.9,
    pointerEvents: 'none',
  },
});
