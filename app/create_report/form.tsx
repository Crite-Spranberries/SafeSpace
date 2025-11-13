import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, CircleX } from 'lucide-react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';
import type { TriggerRef } from '@rn-primitives/select';
import { AppText } from '@/components/ui/AppText';
import MapOnHome from '@/components/ui/MapOnHome';
import DateTimePicker from '@react-native-community/datetimepicker';

const SCREEN_OPTIONS = {
  title: '',
  headerBackTitle: 'Back',
  headerTransparent: true,
  headerLeft: () => (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Icon as={ArrowLeft} size={24} />
    </TouchableOpacity>
  ),
};

const months = [
  { label: 'January', value: 'january' },
  { label: 'February', value: 'february' },
  { label: 'March', value: 'march' },
  { label: 'April', value: 'april' },
  { label: 'May', value: 'may' },
  { label: 'June', value: 'june' },
  { label: 'July', value: 'july' },
  { label: 'August', value: 'august' },
  { label: 'September', value: 'september' },
  { label: 'October', value: 'october' },
  { label: 'November', value: 'november' },
  { label: 'December', value: 'december' },
];

export default function Form() {
  const [formData, setFormData] = useState({
    location: '',
    day: '',
    month: '',
    year: '',
    dateTime: '',
    tradesFieldInput: '',
    tradesFieldArray: [] as string[],
    reportFieldInput: '',
    reportFieldArray: [] as string[],
    description: '',
    witnesses: '',
    individualsInvolved: '',
    actionsTaken: '',
  });

  const [date, setDate] = useState<Date>(new Date(1598051730000));
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

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

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
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

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={styles.pageContainer}>
        <ScrollView>
          <Pressable onPress={Keyboard.dismiss} style={styles.formContainer}>
            <AppText
              weight="bold"
              style={{ fontSize: 24, color: 'white', marginBottom: 20, textAlign: 'center' }}>
              Create Report
            </AppText>
            <View>
              <AppText weight="medium" style={styles.label}>
                Date and Time
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
              <AppText weight="medium" style={styles.label}>
                Type of Report
              </AppText>
              <View style={{ position: 'relative' }}>
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
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
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
              <AppText weight="medium" style={styles.label}>
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
              <AppText weight="medium" style={styles.label}>
                Primary Indivuduals Involved
              </AppText>
              <Input
                placeholder="SProvide a brief description if you do not know their name(s)."
                style={[styles.input, { height: 120, paddingTop: 12 }]}
                placeholderTextColor="#6B6B6B"
                multiline
                value={formData.individualsInvolved}
                onChangeText={(value) => setFormData({ ...formData, individualsInvolved: value })}
              />
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
                Witnesses
              </AppText>
              <Input
                placeholder="Provide a brief description if you do not know their name(s)."
                style={[styles.input, { height: 120, paddingTop: 12 }]}
                placeholderTextColor="#6B6B6B"
                multiline
                value={formData.witnesses}
                onChangeText={(value) => setFormData({ ...formData, witnesses: value })}
              />
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
                Actions Taken
              </AppText>
              <Input
                placeholder="Was anything done in response?"
                style={[styles.input, { height: 120, paddingTop: 12 }]}
                placeholderTextColor="#6B6B6B"
                multiline
                value={formData.actionsTaken}
                onChangeText={(value) => setFormData({ ...formData, actionsTaken: value })}
              />
            </View>
          </Pressable>
        </ScrollView>
        <Button
          variant="purple"
          radius="full"
          style={styles.buttonContainer}
          onPress={() => router.push('/create_report/report')}>
          <AppText weight="medium" style={styles.buttonText}>
            Generate Report
          </AppText>
        </Button>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 66,
  },
  formContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    margin: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    height: 52,
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  buttonText: {
    color: 'white',
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
  inputDay: {
    backgroundColor: '#333',
    borderColor: '#FFFFFF4D',
    width: 'auto',
    flexGrow: 1,
    textAlign: 'center',
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
