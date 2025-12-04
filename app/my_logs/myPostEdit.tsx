import { View, StyleSheet, TouchableOpacity } from 'react-native';
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

export default function MyPostEdit() {
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
    report?: string;
    title?: string;
    id?: string;
    date?: string;
    timestamp?: string;
    location?: string;
    tags?: string;
    report_type?: string;
    trades_field?: string;
    status?: string;
    description?: string;
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
      location: typeof params.location === 'string' ? params.location : '',
      day: '',
      month: '',
      year: '',
      dateTime: '',
      tradesFieldInput: '',
      tradesFieldArray: parseArrayParam(params.trades_field),
      reportFieldInput: '',
      reportFieldArray: parseArrayParam(params.report_type),
      description:
        (typeof params.description === 'string' && params.description) ||
        (typeof params.report === 'string' ? params.report : ''),
      witnessesInput: '',
      witnessesArray: parseArrayParam(params.witnesses),
      primariesInput: '',
      primariesArray: parseArrayParam(params.primaries_involved),
      actionsInput: '',
      actionsArray: parseArrayParam(params.actions_taken),
    };
  }, [params]);

  const [formData, setFormData] = useState(initialFormData);

  // In case params are populated after first render, sync form state
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

  // Initialize date/time pickers from params
  useEffect(() => {
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
  }, [params]);

  const onChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
    setShow(false);
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setShow(true);
    setMode(currentMode);
  };

  const handleAddTradesField = () => {
    const input = formData.tradesFieldInput.trim();
    if (input === '') return;

    setFormData({
      ...formData,
      tradesFieldArray: [...formData.tradesFieldArray, input],
      tradesFieldInput: '',
    });
  };

  const handleAddReportField = () => {
    const input = formData.reportFieldInput.trim();
    if (input === '') return;

    setFormData({
      ...formData,
      reportFieldArray: [...formData.reportFieldArray, input],
      reportFieldInput: '',
    });
  };

  const handleRemoveTradesField = (indexToRemove: number) => {
    const updatedArray = formData.tradesFieldArray.filter((_, index) => index !== indexToRemove);
    setFormData({
      ...formData,
      tradesFieldArray: updatedArray,
    });
  };

  const handleRemoveReportField = (indexToRemove: number) => {
    const updatedArray = formData.reportFieldArray.filter((_, index) => index !== indexToRemove);
    setFormData({
      ...formData,
      reportFieldArray: updatedArray,
    });
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

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <AppText weight="bold" style={styles.title}>
        Edit Information
      </AppText>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.contentContainer}>
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
              <AppText weight="medium" style={styles.label}>
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
                Type of Report
              </AppText>
              <Input
                placeholder="Add a report type"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.reportFieldInput}
                onChangeText={(value) => setFormData({ ...formData, reportFieldInput: value })}
                onSubmitEditing={handleAddReportField}
                returnKeyType="done"
              />
              <View style={styles.badgeContainer}>
                {formData.reportFieldArray.map((field, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveReportField(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{field}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Trades Field
              </AppText>
              <Input
                placeholder="Add a trades field"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.tradesFieldInput}
                onChangeText={(value) => setFormData({ ...formData, tradesFieldInput: value })}
                onSubmitEditing={handleAddTradesField}
                returnKeyType="done"
              />

              <View style={styles.badgeContainer}>
                {formData.tradesFieldArray.map((field, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleRemoveTradesField(index)}
                    style={styles.badgeWrapper}>
                    <View style={styles.badge}>
                      <AppText style={styles.badgeText}>{field}</AppText>
                      <Icon as={CircleX} size={16} color="#808080" fill="white" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <AppText style={styles.sectionTitle} weight="medium">
                Incident Description
              </AppText>
              <Input
                placeholder="Describe what happened and provide any context needed."
                style={[styles.input, { height: 120, paddingTop: 12 }]}
                placeholderTextColor="#6B6B6B"
                multiline
                value={formData.description}
                onChangeText={(value) => setFormData({ ...formData, description: value })}
              />
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
          <Button variant="purple" radius="full" style={styles.saveButton}>
            <AppText weight="medium" style={styles.saveText}>
              Save & Regenerate Report
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
  shortMultilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 52,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
  },
  label: {
    color: 'white',
    fontSize: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderColor: '#FFFFFF4D',
    color: 'white',
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
