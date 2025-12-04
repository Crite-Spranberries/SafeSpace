import React, { useState, useRef } from 'react';
import usePreloadImages from '@/hooks/usePreloadImages';
import { AppText } from '@/components/ui/AppText';
import { StyleSheet, View, ImageBackground, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';

export default function PassCodeScreen({ onUnlock }: { onUnlock?: () => void }) {
  // Preload the recording background image so ImageBackground renders smoothly
  const ready = usePreloadImages([require('@/assets/images/recording-background.png')]);
  const [password, setPassword] = useState(''); // Store actual password
  const [displayValue, setDisplayValue] = useState(''); // Display value with • characters
  const inputRef = useRef<any>(null);

  // Handle password input - store actual value but display masked
  const handlePasswordChange = (text: string) => {
    // When user types, the text parameter contains the new input
    // Since we're displaying bullets, we need to extract what was actually typed
    const currentDisplayLength = displayValue.length;
    const newTextLength = text.length;

    if (newTextLength > currentDisplayLength) {
      // User typed new character(s)
      // The text will be: existing bullets + new character(s)
      // Extract the new character(s) by getting the part after the current display length
      const newPart = text.slice(currentDisplayLength);
      // Remove bullets to get actual characters
      const actualChars = newPart.replace(/•/g, '');

      if (actualChars.length > 0) {
        // Add the actual characters to password
        const updatedPassword = password + actualChars;
        setPassword(updatedPassword);
        setDisplayValue('•'.repeat(updatedPassword.length));
      } else {
        // If no actual chars found, might be a paste or special input
        // In this case, estimate based on length difference
        const lengthDiff = newTextLength - currentDisplayLength;
        const updatedPassword = password + '?'.repeat(lengthDiff); // Placeholder for unknown chars
        setPassword(updatedPassword);
        setDisplayValue('•'.repeat(updatedPassword.length));
      }
    } else if (newTextLength < currentDisplayLength) {
      // User deleted character(s)
      const deletedCount = currentDisplayLength - newTextLength;
      const updatedPassword = password.slice(0, password.length - deletedCount);
      setPassword(updatedPassword);
      setDisplayValue('•'.repeat(updatedPassword.length));
    } else {
      // Same length - might be a replacement (shouldn't happen with normal typing)
      // Keep password as is, just update display
      setDisplayValue('•'.repeat(password.length));
    }
  };

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
              ref={inputRef}
              placeholder="Enter your password"
              style={styles.input}
              value={displayValue}
              onChangeText={handlePasswordChange}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
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
