import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, CircleX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Image, TextInput } from 'react-native';
import { Button } from '@/components/ui/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect, useMemo } from 'react';
import MapOnHome from '@/components/ui/MapOnHome';
import { Input } from '@/components/ui/Input';
import { getRecordingById, updateRecording } from '@/lib/recordings';

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

  const params = useLocalSearchParams<{
    recordingId?: string;
    audioUri?: string;
    title?: string;
    date?: string;
    timestamp?: string;
    duration?: string;
    location?: string;
    report_type?: string;
    witnesses?: string;
    primaries_involved?: string;
    actions_taken?: string;
  }>();

  const initialFormData = useMemo(() => {
    const parseArrayParam = (param: string | undefined): string[] => {
      if (!param) return [];
      try {
        const parsed = JSON.parse(param);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    return {
      title: typeof params.title === 'string' ? params.title : '',
      location: typeof params.location === 'string' ? params.location : '',
      reportTypeInput: '',
      reportTypeArray: parseArrayParam(params.report_type),
      witnessesInput: '',
      witnessesArray: parseArrayParam(params.witnesses),
      primariesInput: '',
      primariesArray: parseArrayParam(params.primaries_involved),
      actionsInput: '',
      actionsArray: parseArrayParam(params.actions_taken),
    };
  }, [params]);

  const [formData, setFormData] = useState(initialFormData);

  const [dateInitialized, setDateInitialized] = useState(false);
  useEffect(() => {
    if (dateInitialized) return;

    const dateStr = typeof params.date === 'string' ? params.date : '';
    const timeStr = typeof params.timestamp === 'string' ? params.timestamp : '';

    if (dateStr && timeStr) {
      try {
        const dateTimeStr = `${dateStr} ${timeStr}`;
        const parsedDate = new Date(dateTimeStr);
        if (!isNaN(parsedDate.getTime())) {
          setDate(parsedDate);
        }
      } catch (e) {
        console.log('Error parsing date:', e);
      }
    }
    setDateInitialized(true);
  }, []);

  const [formInitialized, setFormInitialized] = useState(false);
  useEffect(() => {
    if (formInitialized) return;
    setFormData(initialFormData);
    setFormInitialized(true);
  }, []);

  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

  const onChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShow(false);
  };

  const handleAddPrimary = () => {
    const input = formData.primariesInput.trim();
    if (input === '') return;
    setFormData({
      ...formData,
      primariesArray: [...formData.primariesArray, input],
      primariesInput: '',
    });
  };

  const handleRemovePrimary = (indexToRemove: number) => {
    setFormData({
      ...formData,
      primariesArray: formData.primariesArray.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddReportType = () => {
    const input = formData.reportTypeInput.trim();
    if (input === '') return;
    setFormData({
      ...formData,
      reportTypeArray: [...formData.reportTypeArray, input],
      reportTypeInput: '',
    });
  };

  const handleRemoveReportType = (indexToRemove: number) => {
    setFormData({
      ...formData,
      reportTypeArray: formData.reportTypeArray.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddWitness = () => {
    const input = formData.witnessesInput.trim();
    if (input === '') return;
    setFormData({
      ...formData,
      witnessesArray: [...formData.witnessesArray, input],
      witnessesInput: '',
    });
  };

  const handleRemoveWitness = (indexToRemove: number) => {
    setFormData({
      ...formData,
      witnessesArray: formData.witnessesArray.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleAddAction = () => {
    const input = formData.actionsInput.trim();
    if (input === '') return;
    setFormData({
      ...formData,
      actionsArray: [...formData.actionsArray, input],
      actionsInput: '',
    });
  };

  const handleRemoveAction = (indexToRemove: number) => {
    setFormData({
      ...formData,
      actionsArray: formData.actionsArray.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleSave = async () => {
    try {
      const recordingIdParam = typeof params.recordingId === 'string' ? params.recordingId : null;

      if (!recordingIdParam) {
        Alert.alert('Error', 'Recording ID not found');
        return;
      }

      // Parse date and time
      const dateObj = new Date(date);
      const dateStr = dateObj.toLocaleDateString();
      const timeStr = dateObj.toLocaleTimeString();

      // Get existing recording to preserve reportData
      const existingRecording = await getRecordingById(recordingIdParam);

      // Update recording with new metadata
      await updateRecording(recordingIdParam, {
        title: formData.title,
        date: dateStr,
        timestamp: timeStr,
        location: formData.location,
        tags: formData.reportTypeArray, // Legacy field
        reportData: {
          ...existingRecording?.reportData,
          location_name: formData.location,
          report_type: formData.reportTypeArray,
          witnesses: formData.witnessesArray,
          primaries_involved: formData.primariesArray,
          actions_taken: formData.actionsArray,
        },
      });

      Alert.alert('Success', 'Recording details saved successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (e) {
      console.error('Failed to save recording:', e);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
    }
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
              <Input
                placeholder="Recording title"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.title}
                onChangeText={(value) => setFormData({ ...formData, title: value })}
              />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Date
              </AppText>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <DateTimePicker
                  testID="datePicker"
                  value={date}
                  mode="date"
                  onChange={onChange}
                  accentColor="white"
                />
                <DateTimePicker
                  testID="timePicker"
                  value={date}
                  mode="time"
                  onChange={onChange}
                  is24Hour={true}
                  accentColor="white"
                />
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Location
              </AppText>
              <Input
                placeholder="Search for a location..."
                style={[styles.input, { marginBottom: 12 }]}
                placeholderTextColor="#6B6B6B"
                value={formData.location}
                onChangeText={(value) => setFormData({ ...formData, location: value })}
              />
              <MapOnHome />
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Report Type
              </AppText>
              <Input
                placeholder="Add a report type"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.reportTypeInput}
                onChangeText={(value) => setFormData({ ...formData, reportTypeInput: value })}
                onSubmitEditing={handleAddReportType}
                returnKeyType="done"
              />
              <View style={styles.badgeContainer}>
                {formData.reportTypeArray.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveReportType(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{item}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Primary Individuals Involved
              </AppText>
              <Input
                placeholder="Add a person involved"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.primariesInput}
                onChangeText={(value) => setFormData({ ...formData, primariesInput: value })}
                onSubmitEditing={handleAddPrimary}
                returnKeyType="done"
              />
              <View style={styles.badgeContainer}>
                {formData.primariesArray.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemovePrimary(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{item}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Witnesses
              </AppText>
              <Input
                placeholder="Add a witness"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.witnessesInput}
                onChangeText={(value) => setFormData({ ...formData, witnessesInput: value })}
                onSubmitEditing={handleAddWitness}
                returnKeyType="done"
              />
              <View style={styles.badgeContainer}>
                {formData.witnessesArray.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveWitness(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{item}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Actions Taken
              </AppText>
              <Input
                placeholder="Add an action taken"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.actionsInput}
                onChangeText={(value) => setFormData({ ...formData, actionsInput: value })}
                onSubmitEditing={handleAddAction}
                returnKeyType="done"
              />
              <View style={styles.badgeContainer}>
                {formData.actionsArray.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveAction(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{item}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <Button variant="purple" radius="full" style={styles.saveButton} onPress={handleSave}>
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
  input: {
    backgroundColor: '#333',
    borderColor: '#FFFFFF4D',
    color: 'white',
  },
  saveButton: {
    height: 52,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badgeWrapper: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: '#FFFFFF80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 16,
  },
});
