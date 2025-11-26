import React, { useCallback, useEffect, useRef, useState } from 'react';
import usePreloadImages from '@/hooks/usePreloadImages';
import { AppText } from '@/components/ui/AppText';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { router, Stack } from 'expo-router';
import { Button } from './Button';

export default function PassCodeScreen({ onUnlock }: { onUnlock?: () => void }) {
  // Preload the recording background image so ImageBackground renders smoothly
  const ready = usePreloadImages([require('@/assets/images/recording-background.png')]);
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (onUnlock) {
      onUnlock();
    }
  };

  if (!ready) {
    return (
      <>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <ImageBackground
        source={require('@/assets/images/recording-background.png')}
        style={styles.background}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.pageContainer}>
            <AppText weight="bold" style={styles.pageTitle}>
              My Logs
            </AppText>
            <AppText weight="medium" style={styles.contentTitle}>
              Private Access
            </AppText>
            <AppText style={styles.contentText}>
              Please ensure you are in a place of safety before accessing your private logs.
            </AppText>
            <TextInput
              placeholder="Enter your password"
              secureTextEntry={true}
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
            <Button
              variant={password ? 'purple' : 'darkGrey'}
              radius="full"
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={!password}>
              <AppText weight="medium" style={styles.confirmButtonText}>
                Confirm
              </AppText>
            </Button>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 26,
  },
  pageTitle: {
    fontSize: 26,
    lineHeight: 28,
    color: '#fff',
    marginBottom: 160,
  },
  contentTitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 30,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  confirmButton: {
    marginTop: 24,
    width: '50%',
    height: 50,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 20,
  },
});
