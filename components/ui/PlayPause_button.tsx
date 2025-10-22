import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import { Pause } from 'lucide-react-native';
import { Play } from 'lucide-react-native';

type PlayPauseButtonProps = {
  isPlaying: boolean;
  onPress: () => void;
};

export function PlayPauseButton({ isPlaying, onPress }: PlayPauseButtonProps) {
  return (
    <Button
      variant={isPlaying ? 'pauseRecording' : 'startRecording'}
      radius="sm"
      size="icon"
      onPress={onPress}>
      <View pointerEvents="none">{isPlaying ? <Pause /> : <Play />}</View>
    </Button>
  );
}
