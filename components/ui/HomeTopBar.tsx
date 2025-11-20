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
  /** Enable liquid glass (frosted blur + gloss) effect */
  glass?: boolean;
  /** Blur intensity when using expo-blur (0-100). Higher = more blur */
  glassIntensity?: number;
  /** Background alpha for the glass surface (0-1). Lower makes it more transparent */
  glassBgAlpha?: number;
  /** Opacity for the gloss overlay (0-1) */
  glossOpacity?: number;
  /** Border color for the glass surface */
  borderColor?: string;
  /** Border width in px */
  borderWidth?: number;
  /** Corner radius in px */
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
  glassBgAlpha = 0.6,
  glossOpacity = 0,
  borderColor = '#FFFFFF',
  borderWidth = 1,
  radius = 24,
  ...rest
}: HomeTopBarProps) {
  // Try to require expo-blur at runtime. Metro/bundler will fail on a static
  // import if the package isn't installed, so we load it dynamically and
  // fall back to a plain View when it's not available.
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
    containerProps.tint = 'light';
  }
  const bgColor = `rgba(255,255,255,${glassBgAlpha})`;

  return (
    <Container
      {...containerProps}
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
        {/* Notification dot */}
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
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderColor: '#FFFFFF',
    // subtle shadow to lift the glass
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
