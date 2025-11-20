import { Button } from '@/components/ui/Button';
import { View } from 'react-native';
import { Pause } from 'lucide-react-native';
import { Disc } from 'lucide-react-native';

type PlayPauseButtonProps = {
  isPlaying: boolean;
  onPress: () => void;
};

export function PlayPauseButton({ isPlaying, onPress }: PlayPauseButtonProps) {
  return (
    <Button
      variant={isPlaying ? 'pauseRecording' : 'startRecording'}
      radius="sm"
      size="customRecordingLarge"
      onPress={onPress}>
      <View pointerEvents="none">{isPlaying ? <Pause /> : <Disc />}</View>
    </Button>
  );
}
