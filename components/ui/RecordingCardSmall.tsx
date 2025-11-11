import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Audio } from 'expo-av';
import { Icon } from '@/components/ui/icon';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import { AppText } from './AppText';

type RecordingCardSmallProps = {
  duration?: string;
  isPlaying?: boolean;
  onPlayPress?: () => void;
  onPrevPress?: () => void;
  onNextPress?: () => void;
  // extra styles passed from pages
  style?: StyleProp<ViewStyle>;
};

export default function RecordingCardSmall({
  duration = '0:00',
  isPlaying = false,
  onPlayPress,
  onPrevPress,
  onNextPress,
  style,
}: RecordingCardSmallProps) {
  const formatMs = (ms: number): string => {
    if (!ms || ms < 0 || !Number.isFinite(ms)) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  const [playing, setPlaying] = React.useState<boolean>(!!isPlaying);
  const [loading, setLoading] = React.useState<boolean>(false);
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [trackWidth, setTrackWidth] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragProgress, setDragProgress] = React.useState<number>(0);
  const [statusProgress, setStatusProgress] = React.useState<number>(0); // 0..1
  const durationRef = React.useRef<number>(0);
  const [positionMs, setPositionMs] = React.useState<number>(0);
  const [durationMs, setDurationMs] = React.useState<number>(0);
  const finishedRef = React.useRef<boolean>(false);

  const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  React.useEffect(() => {
    // Allow playback in iOS silent mode
    void Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    // cleanup: unload sound when unmounting
    return () => {
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch {
          // ignore
        }
      })();
    };
  }, []);

  const togglePlay = async () => {
    if (loading) return;
    try {
      if (!soundRef.current) {
        setLoading(true);
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/test_audio.mp3'),
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setLoading(false);
        setPlaying(true);
        soundRef.current.setOnPlaybackStatusUpdate((st: any) => {
          if (!st?.isLoaded) return;
          const d = st.durationMillis ?? durationRef.current ?? 0;
          const p = st.positionMillis ?? 0;
          durationRef.current = d;
          if (d > 0) setStatusProgress(clamp(p / d));
          setPositionMs(p || 0);
          setDurationMs(d || 0);
          if (st.didJustFinish) {
            setPlaying(false);
            finishedRef.current = true;
          }
        });
      } else {
        const status: any = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlaying(false);
        } else if (status.isLoaded) {
          // If previously finished or at end, restart from beginning before playing
          const dur = status?.durationMillis ?? durationRef.current ?? 0;
          const pos = status?.positionMillis ?? 0;
          const nearEnd = dur > 0 && pos >= Math.max(0, dur - 200);
          if (finishedRef.current || nearEnd) {
            try {
              await soundRef.current.setPositionAsync(0);
              setPositionMs(0);
              setStatusProgress(0);
            } catch {
              // ignore
            } finally {
              finishedRef.current = false;
            }
          }
          await soundRef.current.playAsync();
          setPlaying(true);
        } else {
          await soundRef.current.playAsync();
          setPlaying(true);
        }
      }
      onPlayPress?.();
    } catch {
      setLoading(false);
    }
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const updateProgressFromX = async (x: number) => {
    const width = Math.max(1, trackWidth);
    const next = clamp(x / width);
    setDragProgress(next);
    if (soundRef.current) {
      const s: any = await soundRef.current.getStatusAsync();
      const dur = durationRef.current || s?.durationMillis || 0;
      if (dur > 0) {
        const target = Math.floor(next * dur);
        try {
          await soundRef.current.setPositionAsync(target);
          setPositionMs(target);
        } catch {
          // ignore
        }
      }
    }
  };

  const onSeekStart = async (e: GestureResponderEvent) => {
    if (!soundRef.current) return false;
    setIsDragging(true);
    await updateProgressFromX(e.nativeEvent.locationX);
    return true;
  };

  const onSeekMove = async (e: GestureResponderEvent) => {
    if (!soundRef.current) return;
    await updateProgressFromX(e.nativeEvent.locationX);
  };

  const onSeekRelease = async (e: GestureResponderEvent) => {
    if (!soundRef.current) return;
    await updateProgressFromX(e.nativeEvent.locationX);
    setIsDragging(false);
  };

  const seekBy = async (deltaMs: number) => {
    if (!soundRef.current) return;
    try {
      const st: any = await soundRef.current.getStatusAsync();
      if (!st?.isLoaded) return;
      const dur = st.durationMillis ?? durationRef.current ?? 0;
      const pos = st.positionMillis ?? positionMs ?? 0;
      const target = Math.max(
        0,
        Math.min(dur > 0 ? dur - 1 : Number.MAX_SAFE_INTEGER, pos + deltaMs)
      );
      await soundRef.current.setPositionAsync(target);
      setPositionMs(target);
      if (dur > 0) setStatusProgress(clamp(target / dur));
      // If we moved away from end, reset finished flag
      if (finishedRef.current && target < (dur > 0 ? dur - 200 : target)) {
        finishedRef.current = false;
      }
    } catch {
      // ignore
    }
  };
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.card}>
        {/* Recording progress row */}
        <View style={styles.recordingBar}>
          <View
            style={styles.progressWrap}
            onLayout={onTrackLayout}
            onStartShouldSetResponder={() => !!soundRef.current}
            onMoveShouldSetResponder={() => !!soundRef.current}
            onStartShouldSetResponderCapture={() => !!soundRef.current}
            onMoveShouldSetResponderCapture={() => !!soundRef.current}
            onResponderTerminationRequest={() => false}
            onResponderGrant={onSeekStart}
            onResponderMove={onSeekMove}
            onResponderRelease={onSeekRelease}
            onResponderTerminate={() => setIsDragging(false)}>
            <View style={styles.progressTrack} />
            <View
              style={[
                styles.progressFill,
                {
                  width: Math.max(
                    0,
                    Math.min(trackWidth, (isDragging ? dragProgress : statusProgress) * trackWidth)
                  ),
                },
              ]}
            />
            <View
              style={[
                styles.progressKnob,
                {
                  left: trackWidth
                    ? Math.min(
                        Math.max((isDragging ? dragProgress : statusProgress) * trackWidth - 8, 0),
                        Math.max(trackWidth - 16, 0)
                      )
                    : 0,
                },
              ]}
            />
          </View>
          <AppText style={styles.duration}>
            {formatMs(positionMs)} / {durationMs > 0 ? formatMs(durationMs) : duration || '0:00'}
          </AppText>
        </View>

        {/* Control buttons row (centered) */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => {
              void seekBy(-2000);
              onPrevPress?.();
            }}
            activeOpacity={0.85}>
            <Icon as={SkipBack} color="#5E349E" size={24} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => void togglePlay()}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause' : 'Play'}>
            <Icon as={playing ? Pause : Play} color="#5E349E" size={24} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => {
              void seekBy(2000);
              onNextPress?.();
            }}
            activeOpacity={0.85}>
            <Icon as={SkipForward} color="#5E349E" size={24} strokeWidth={2.2} />
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  progressWrap: {
    flex: 1,
    height: 16,
    position: 'relative',
    marginRight: 12,
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
    shadowColor: '#5E349E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  duration: {
    color: '#000000',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 8,
  },
  controlsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
