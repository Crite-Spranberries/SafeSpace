import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { useNavigation } from 'expo-router';
import { Input } from '@/components/ui/input';
import StatusBar from '@/components/ui/statusBar';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Plus, FolderLock } from 'lucide-react-native';
import { useSwipe } from '@/hooks/useSwipe';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as React from 'react';
import type { TriggerRef } from '@rn-primitives/select';

export default function Form() {
  const navigation = useNavigation();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    dateTime: '',
    tradesField: '',
    reportType: '',
    harassmentType: '',
    severity: '',
    description: '',
    documentation: '',
    witnesses: '',
  });

  const { onTouchStart, onTouchEnd } = useSwipe(onSwipeLeft, onSwipeRight, 3);

  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  const selectWidth = Dimensions.get('window').width; // added: full screen width

  function onOpenStart() {
    ref.current?.open();
  }

  function onSwipeLeft() {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, 3));
  }

  function onSwipeRight() {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }

  const handleNext = () => {
    if (currentPage < 3) {
      setCurrentPage(currentPage + 1);
    } else if (currentPage === 3) {
      // Submit form and navigate to report page
      router.push('/recording_sandbox/report');
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} style={styles.background} />
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.pageContainer}>
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <ScrollView
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            scrollEnabled={false}
            style={styles.formContainer}
            contentContainerStyle={styles.formContentContainer}>
            <StatusBar state={currentPage} onPageSelect={setCurrentPage} />

            {currentPage === 1 && (
              <>
                <Text variant="h3" style={{ textAlign: 'center', marginBottom: 8 }}>
                  General Information
                </Text>
                <View>
                  <Text>Location</Text>
                  <Input
                    placeholder="Location"
                    style={styles.input}
                    placeholderTextColor="#6B6B6B"
                    value={formData.location}
                    onChangeText={(value) => setFormData({ ...formData, location: value })}
                  />
                </View>
                <View>
                  <Text>Date and Time</Text>
                  <Input
                    placeholder="Date and Time"
                    style={styles.input}
                    placeholderTextColor="#6B6B6B"
                    value={formData.dateTime}
                    onChangeText={(value) => setFormData({ ...formData, dateTime: value })}
                  />
                </View>
                <View>
                  <Text>Trades Field</Text>
                  <Input
                    placeholder="Trades Field"
                    style={styles.input}
                    placeholderTextColor="#6B6B6B"
                    value={formData.tradesField}
                    onChangeText={(value) => setFormData({ ...formData, tradesField: value })}
                  />
                </View>

                <Text>Type of Report</Text>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                      variant={formData.reportType === 'Harassment' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => setFormData({ ...formData, reportType: 'Harassment' })}>
                      <Text>Harassment</Text>
                    </Button>
                    <Button
                      variant={formData.reportType === 'Safety Hazards' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1 }}
                      onPress={() => setFormData({ ...formData, reportType: 'Safety Hazards' })}>
                      <Text>Safety Hazards</Text>
                    </Button>
                  </View>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Button
                      variant={formData.reportType === 'Discrimination' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => setFormData({ ...formData, reportType: 'Discrimination' })}>
                      <Text>Discrimination</Text>
                    </Button>
                    <Button
                      variant={formData.reportType === 'Violence' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1 }}
                      onPress={() => setFormData({ ...formData, reportType: 'Violence' })}>
                      <Text>Violence</Text>
                    </Button>
                  </View>
                </View>
              </>
            )}

            {currentPage === 2 && (
              <>
                <Text variant="h3" style={{ textAlign: 'center', marginBottom: 8 }}>
                  Incident Details
                </Text>
                <Text>Type of harassment</Text>
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Button
                      variant={formData.harassmentType === 'Verbal' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => setFormData({ ...formData, harassmentType: 'Verbal' })}>
                      <Text>Verbal</Text>
                    </Button>
                    <Button
                      variant={formData.harassmentType === 'Physical' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1 }}
                      onPress={() => setFormData({ ...formData, harassmentType: 'Physical' })}>
                      <Text>Physical</Text>
                    </Button>
                  </View>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <Button
                      variant={formData.harassmentType === 'Visual' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1, marginRight: 8 }}
                      onPress={() => setFormData({ ...formData, harassmentType: 'Visual' })}>
                      <Text>Visual</Text>
                    </Button>
                    <Button
                      variant={formData.harassmentType === 'Online' ? 'purple' : 'darkGrey'}
                      style={{ flex: 1 }}
                      onPress={() => setFormData({ ...formData, harassmentType: 'Online' })}>
                      <Text>Online</Text>
                    </Button>
                  </View>
                </View>
                <View>
                  <Text>Severity</Text>
                  <Select>
                    <SelectTrigger
                      onTouchStart={onTouchStart}
                      ref={ref}
                      style={{ backgroundColor: 'white' }}>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent
                      insets={contentInsets}
                      style={{ width: selectWidth, backgroundColor: 'white' }}>
                      <SelectGroup>
                        <SelectLabel>Severity</SelectLabel>
                        <SelectItem label="Low" value="low">
                          Low
                        </SelectItem>
                        <SelectItem label="Medium" value="medium">
                          Medium
                        </SelectItem>
                        <SelectItem label="High" value="high">
                          High
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </View>
                <View>
                  <Text>Briefly describe the incident:</Text>
                  <Input
                    placeholder="Start typing..."
                    style={[styles.input, { height: 120, paddingTop: 12 }]}
                    placeholderTextColor="#6B6B6B"
                    multiline
                    value={formData.description}
                    onChangeText={(value) => setFormData({ ...formData, description: value })}
                  />
                </View>
              </>
            )}

            {currentPage === 3 && (
              <>
                <Text variant="h3" style={{ textAlign: 'center', marginBottom: 8 }}>
                  Witnesses / Evidence
                </Text>
                <View>
                  <Text>Describe those who were involved:</Text>
                  <Input
                    placeholder="Avoid naming people directly"
                    style={[styles.input, { height: 80, paddingTop: 12 }]}
                    placeholderTextColor="#6B6B6B"
                    multiline
                    value={formData.documentation}
                    onChangeText={(value) => setFormData({ ...formData, documentation: value })}
                  />
                </View>
                <View>
                  <Text>Witnesses, if any:</Text>
                  <Input
                    placeholder="Avoid naming people directly"
                    style={[styles.input, { height: 80, paddingTop: 12 }]}
                    placeholderTextColor="#6B6B6B"
                    multiline
                    value={formData.documentation}
                    onChangeText={(value) => setFormData({ ...formData, documentation: value })}
                  />
                </View>
                <View>
                  <Text>Attach any supporting evidence you have:</Text>
                  <Button
                    variant={formData.reportType === 'Discrimination' ? 'purple' : 'darkGrey'}
                    size="lg"
                    onPress={() => setFormData({ ...formData, reportType: 'Discrimination' })}>
                    <Icon as={Plus} size={24} color="#fff" style={{ flex: 1, marginRight: 8 }} />
                    <Text>Add from your phone</Text>
                  </Button>
                </View>
                <View>
                  <Button
                    variant={formData.reportType === 'Violence' ? 'purple' : 'darkGrey'}
                    size="lg"
                    onPress={() => setFormData({ ...formData, reportType: 'Violence' })}>
                    <Icon
                      as={FolderLock}
                      size={24}
                      color="#fff"
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <Text>Choose from My Logs</Text>
                  </Button>
                </View>
              </>
            )}
          </ScrollView>
        </Pressable>

        <View style={styles.buttonContainer}>
          <Button
            variant="darkGrey"
            size="lg"
            radius="full"
            onPress={handleBack}
            style={{ flex: 1, marginRight: 8 }}>
            <Text>Back</Text>
          </Button>
          <Button variant="purple" size="lg" radius="full" style={{ flex: 1 }} onPress={handleNext}>
            <Text>{currentPage === 3 ? 'Submit' : 'Next'}</Text>
          </Button>
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
  pageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  formContentContainer: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
  },
  input: {
    backgroundColor: 'white',
  },
});
