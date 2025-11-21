import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Image, TextInput } from 'react-native';
import { Button } from '@/components/ui/Button';

export default function MyRecordingEdit() {
  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon as={ArrowLeft} size={16} />
      </TouchableOpacity>
    ),
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <AppText weight="bold" style={styles.title}>
        Edit Details
      </AppText>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Title
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="Voice Recording 1"
                placeholderTextColor="#fff"
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Location
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="3700 Willingdon Avenue, Burnaby"
                placeholderTextColor="#fff"
              />
              <Image
                style={styles.mapImage}
                source={require('@/assets/images/map-placeholder.png')}
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Date
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="November 4, 2025"
                placeholderTextColor="#fff"
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Time
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="10:15 AM"
                placeholderTextColor="#fff"
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Tags
              </AppText>
              <TextInput
                style={styles.textInput}
                placeholder="Add a tag..."
                placeholderTextColor="#fff"
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Edit Transcript
              </AppText>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="Edit here..."
                placeholderTextColor="#fff"
                multiline={true}
                numberOfLines={6}
              />
            </View>
          </View>
          <Button variant="purple" radius="full" style={styles.saveButton}>
            <AppText weight="medium" style={styles.saveText}>
              Save
            </AppText>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  title: {
    fontSize: 24,
    marginTop: 70,
    color: '#FFF',
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 15,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  contentContainer: {
    justifyContent: 'center',
    gap: 24,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
    color: '#FFF',
  },
  textInput: {
    height: 48,
    borderColor: 'rgba(255, 255, 255, 0.30)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#333333',
    color: '#FFF',
    fontSize: 16,
    lineHeight: 20,
    fontFamily: 'Satoshi-Regular',
  },
  mapImage: {
    width: '100%',
    height: 148,
    borderRadius: 12,
    marginTop: 12,
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
  },
});
