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
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { Icon } from '@/components/ui/Icon';
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
  // expo-audio player & status
  const player = useAudioPlayer(require('../../assets/audio/test_audio.mp3'));
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;
  const isLoaded = status.isLoaded;
  const [trackWidth, setTrackWidth] = React.useState<number>(0);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragProgress, setDragProgress] = React.useState<number>(0);
  const [statusProgress, setStatusProgress] = React.useState<number>(0); // 0..1
  const [positionMs, setPositionMs] = React.useState<number>(0);
  const [durationMs, setDurationMs] = React.useState<number>(0);

  const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  React.useEffect(() => {
    // Enable silent mode playback (new API key name differs)
    void setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  // Derive progress & ms values from status
  React.useEffect(() => {
    const durSec = status.duration || 0;
    const posSec = status.currentTime || 0;
    if (durSec > 0) setStatusProgress(clamp(posSec / durSec));
    setPositionMs(Math.max(0, posSec * 1000));
    setDurationMs(Math.max(0, durSec * 1000));
  }, [status.currentTime, status.duration]);

  const togglePlay = () => {
    if (!isLoaded) return;
    // If finished or at end, seek to start before playing again
    const nearEnd = durationMs > 0 && positionMs >= Math.max(0, durationMs - 200);
    if (!playing) {
      if (nearEnd || status.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    } else {
      player.pause();
    }
    onPlayPress?.();
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const updateProgressFromX = (x: number) => {
    const width = Math.max(1, trackWidth);
    const next = clamp(x / width);
    setDragProgress(next);
    if (durationMs > 0) {
      const targetMs = Math.floor(next * durationMs);
      player.seekTo(targetMs / 1000);
      setPositionMs(targetMs);
    }
  };

  const onSeekStart = (e: GestureResponderEvent) => {
    if (!isLoaded) return false;
    setIsDragging(true);
    updateProgressFromX(e.nativeEvent.locationX);
    return true;
  };

  const onSeekMove = (e: GestureResponderEvent) => {
    if (!isLoaded) return;
    updateProgressFromX(e.nativeEvent.locationX);
  };

  const onSeekRelease = (e: GestureResponderEvent) => {
    if (!isLoaded) return;
    updateProgressFromX(e.nativeEvent.locationX);
    setIsDragging(false);
  };

  const seekBy = (deltaMs: number) => {
    if (!isLoaded || durationMs <= 0) return;
    const pos = positionMs;
    const target = Math.max(0, Math.min(durationMs - 1, pos + deltaMs));
    player.seekTo(target / 1000);
    setPositionMs(target);
    setStatusProgress(clamp(target / durationMs));
  };
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.card}>
        {/* Recording progress row */}
        <View style={styles.recordingBar}>
          <View
            style={styles.progressWrap}
            onLayout={onTrackLayout}
            onStartShouldSetResponder={() => isLoaded}
            onMoveShouldSetResponder={() => isLoaded}
            onStartShouldSetResponderCapture={() => isLoaded}
            onMoveShouldSetResponderCapture={() => isLoaded}
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
              void seekBy(-2000); // 2 seconds back
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
              void seekBy(2000); // 2 seconds forward
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
