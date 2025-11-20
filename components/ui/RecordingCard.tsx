import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { ArrowRight, Play, Pause } from 'lucide-react-native';
import { AppText } from './AppText';

type RecordingCardProps = {
  tags?: string[];
  title: string;
  location?: string;
  timestamp?: string;
  duration?: string;
  /** Initial playing state */
  initialPlaying?: boolean;
  /** Progress (0-1). If provided, component is controlled for progress */
  progress?: number;
  /** Enable user dragging to seek */
  seekEnabled?: boolean;
  /** Callback when user seeks (0-1) */
  onSeek?: (p: number) => void;
  /** Notify parent when user starts/ends dragging, e.g. to disable ScrollView scrolling */
  onDragChange?: (dragging: boolean) => void;
  onPlayPress?: () => void;
  onDetailsPress?: () => void;
};

export default function RecordingCard({
  tags = [],
  title,
  location,
  timestamp,
  duration = '0:00',
  initialPlaying,
  progress,
  seekEnabled = true,
  onSeek,
  onDragChange,
  onPlayPress,
  onDetailsPress,
}: RecordingCardProps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(!!initialPlaying);
  const [internalProgress, setInternalProgress] = React.useState<number>(0);
  const [trackWidth, setTrackWidth] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragProgress, setDragProgress] = React.useState<number>(0);
  const lastControlledProgressRef = React.useRef<number>(0);

  const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const isControlled = typeof progress === 'number';

  // Sync last known controlled progress when not dragging
  React.useEffect(() => {
    if (isControlled && !isDragging && typeof progress === 'number') {
      lastControlledProgressRef.current = clamp(progress);
    }
  }, [isControlled, isDragging, progress]);

  // Effective progress prioritizes drag position while dragging to avoid flicker
  const effectiveProgress = clamp(
    isDragging ? dragProgress : isControlled ? lastControlledProgressRef.current : internalProgress
  );

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const updateProgressFromX = (x: number) => {
    const width = Math.max(1, trackWidth);
    const next = clamp(x / width);
    // Update local drag state always for smooth visuals
    setDragProgress(next);
    if (!isControlled) {
      setInternalProgress(next);
    }
    onSeek?.(next);
  };

  const onSeekStart = (e: GestureResponderEvent) => {
    if (!seekEnabled) return false;
    setIsDragging(true);
    onDragChange?.(true);
    updateProgressFromX(e.nativeEvent.locationX);
    return true;
  };

  const onSeekMove = (e: GestureResponderEvent) => {
    if (!seekEnabled) return;
    updateProgressFromX(e.nativeEvent.locationX);
  };

  const onSeekRelease = (e: GestureResponderEvent) => {
    if (!seekEnabled) return;
    // Final update
    const width = Math.max(1, trackWidth);
    const next = clamp(e.nativeEvent.locationX / width);
    setDragProgress(next);
    if (!isControlled) {
      setInternalProgress(next);
    } else {
      // Optimistically set last known progress to avoid jump until parent updates
      lastControlledProgressRef.current = next;
    }
    onSeek?.(next);
    setIsDragging(false);
    onDragChange?.(false);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    onPlayPress?.();
  };

  // Pre-compute positions to keep knob and halo perfectly centered even at edges
  const fillWidth = trackWidth
    ? Math.max(0, Math.min(trackWidth, effectiveProgress * trackWidth))
    : 0;
  const rawX = effectiveProgress * trackWidth; // 0..trackWidth
  const knobLeft = trackWidth ? Math.min(Math.max(rawX - 8, 0), Math.max(trackWidth - 16, 0)) : 0; // knob is 16px wide
  const haloLeft = knobLeft - 4; // halo is 24px wide, center align with 16px knob

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {tags.length > 0 && (
          <View style={styles.topBlock}>
            <AppText style={styles.tags} numberOfLines={1}>
              {tags.join(', ')}
            </AppText>
          </View>
        )}

        <AppText numberOfLines={1} style={styles.title} weight="medium">
          {title}
        </AppText>

        {location ? <AppText style={styles.location}>{location}</AppText> : null}

        {timestamp ? <AppText style={styles.timestamp}>{timestamp}</AppText> : null}

        {/* Recording progress row */}
        <View style={styles.progressRow}>
          <View
            style={styles.progressWrap}
            onLayout={onTrackLayout}
            onStartShouldSetResponder={() => seekEnabled}
            onMoveShouldSetResponder={() => seekEnabled}
            onStartShouldSetResponderCapture={() => seekEnabled}
            onMoveShouldSetResponderCapture={() => seekEnabled}
            onResponderTerminationRequest={() => false}
            onResponderGrant={onSeekStart}
            onResponderMove={onSeekMove}
            onResponderRelease={onSeekRelease}
            onResponderTerminate={() => {
              // If parent forcefully terminates, end drag
              if (isDragging) {
                setIsDragging(false);
                onDragChange?.(false);
              }
            }}>
            <View style={styles.progressTrack} />
            <View style={[styles.progressFill, { width: fillWidth }]} />
            {/* Knob halo only while pressing/dragging */}
            {isDragging && (
              <View pointerEvents="none" style={[styles.knobHalo, { left: haloLeft }]} />
            )}
            <View style={[styles.progressKnob, { left: knobLeft }]} />
          </View>
          <AppText weight="medium" style={styles.duration}>
            {duration}
          </AppText>
        </View>

        {/* Bottom actions */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            onPress={handleTogglePlay}
            activeOpacity={0.85}
            style={styles.playBtn}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <Icon as={Pause} color="#5E349E" size={20} strokeWidth={2.2} />
            ) : (
              <Icon as={Play} color="#5E349E" size={20} strokeWidth={2.2} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onDetailsPress} activeOpacity={0.85} style={styles.detailsBtn}>
            <AppText style={styles.detailsText} weight="medium">
              Details
            </AppText>
            <Icon as={ArrowRight} color="#5E349E" size={18} strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)', // Neutral/WHITE-70%
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  topBlock: {
    flexDirection: 'row',
  },
  tags: {
    color: '#5E349E', // Violet/700
    fontSize: 16,
    lineHeight: 20,
  },
  title: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 24,
  },
  location: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  progressRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressWrap: {
    flex: 1,
    height: 16,
    position: 'relative',
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 6,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 6,
    height: 4,
    backgroundColor: '#5E349E',
    borderRadius: 999,
  },
  progressKnob: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#5E349E',
    left: 0,
    top: 0,
    // iOS shadow for better feedback
    shadowColor: '#5E349E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Android subtle elevation (will affect container)
    elevation: 2,
  },
  knobHalo: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(94,52,158,0.15)',
    top: -4,
  },
  duration: {
    color: '#000000',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 8,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsText: {
    color: '#5E349E',
    fontSize: 14,
    lineHeight: 18,
    marginRight: 8,
  },
});
