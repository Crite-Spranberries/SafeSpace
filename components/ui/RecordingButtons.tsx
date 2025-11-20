import React from 'react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { PlayPauseButton } from './PlayPauseButton';

import { X } from 'lucide-react-native';
import { Check } from 'lucide-react-native';

const Flex = () => {
  return (
    <View
      style={[
        styles.container,
        {
          // Try setting `flexDirection` to `"row"`.
          flexDirection: 'column',
        },
      ]}></View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default function RecordingControls() {
  return (
    <>
      <Text>Timestamp goes here</Text>
      <View
        style={[
          styles.container,
          {
            // Try setting `flexDirection` to `"row"`.
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
          },
        ]}>
        <Button variant="cancelRecording">
          <X />
        </Button>
        <PlayPauseButton />
        <Button variant="saveRecording">
          <Link href="/recording_sandbox/details" asChild>
            <Check />
          </Link>
        </Button>
      </View>
    </>
  );
}
