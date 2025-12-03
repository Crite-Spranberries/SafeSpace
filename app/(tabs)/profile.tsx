import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { StyleSheet, View, Alert, ActivityIndicator, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Asset } from 'expo-asset';
import { AppText } from '@/components/ui/AppText';

export default function Profile() {
  const videoWidth = useRef(new Animated.Value(80)).current;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  const videoSource = require('../../assets/video/ai-safi-blob.mov');

  // Preload the video asset
  useEffect(() => {
    const preloadAsset = async () => {
      try {
        const asset = Asset.fromModule(videoSource);
        await asset.downloadAsync();
        setVideoLoaded(true);
      } catch (error) {
        console.warn('Failed to preload video asset:', error);
        setVideoLoaded(true); // Continue anyway
      }
    };
    preloadAsset();
  }, []);

  const player = useVideoPlayer(videoLoaded ? videoSource : null, (player) => {
    player.loop = true;
    player.muted = true;
    player.playbackRate = 1;

    // Add status listener to know when video is ready
    player.addListener('statusChange', (status) => {
      if (status.status === 'readyToPlay') {
        setPlayerReady(true);
        player.play();
      }
    });
  });
  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={styles.page}>
        <AppText weight="bold" style={styles.heading}>
          🚧 Work in Progress 🚧
        </AppText>
        <View style={styles.container}>
          <Animated.View
            style={{
              width: videoWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              aspectRatio: 1,
              alignSelf: 'center',
            }}>
            {!playerReady && (
              <View style={{ width: '100%', height: '100%' }}>
                <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
              </View>
            )}
            <VideoView
              style={[{ width: '100%', height: '100%' }, !playerReady && styles.hidden]}
              player={player}
              allowsPictureInPicture={false}
              nativeControls={false}
            />
          </Animated.View>
        </View>
        <View style={styles.bottomContainer}>
          <View>
            <AppText weight="bold" style={[styles.warningText, styles.largeWarningText]}>
              Do <AppText weight="black">NOT</AppText> press the button!!!
            </AppText>
            <AppText style={styles.warningText}>
              The button below is for development use only
            </AppText>
          </View>
          <View style={styles.clearButtonWrap}>
            <Button
              variant="destructive"
              radius="full"
              onPress={async () => {
                // confirm with the user
                const confirmed = await new Promise<boolean>((resolve) => {
                  Alert.alert(
                    'Clear All Stored Data?',
                    'This will remove all AsyncStorage data for the app. This action cannot be undone.',
                    [
                      { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                      { text: 'Clear', onPress: () => resolve(true), style: 'destructive' },
                    ],
                    { cancelable: true }
                  );
                });

                if (!confirmed) return;

                try {
                  await AsyncStorage.clear();
                  Alert.alert('Cleared', 'All stored data has been removed.');
                } catch (err) {
                  console.error('Failed to clear AsyncStorage', err);
                  Alert.alert('Error', 'Failed to clear stored data.');
                }
              }}>
              <Text style={{ color: 'white', fontSize: 18 }}>☠️ Clear All Local Data ☠️</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  page: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 24,
  },
  bottomContainer: {
    gap: 16,
  },
  heading: {
    color: 'white',
    fontSize: 32,
    textAlign: 'center',
  },
  clearButtonWrap: {
    paddingHorizontal: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hidden: {
    opacity: 0,
    position: 'absolute',
  },
  warningText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 4,
  },
  largeWarningText: {
    fontSize: 24,
  },
});
