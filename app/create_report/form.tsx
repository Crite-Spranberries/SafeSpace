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
  TouchableOpacity,
} from 'react-native';
import { router, Stack, useRouter } from 'expo-router';
import { Button, buttonTextVariants } from '@/components/ui/button';
import { useNavigation } from 'expo-router';
import { Input } from '@/components/ui/input';
import StatusBar from '@/components/ui/statusBar';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Plus, FolderLock, ArrowLeft } from 'lucide-react-native';
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
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import MapOnHome from '@/components/ui/MapOnHome';

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
  const navigation = useNavigation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    location: '',
    day: '',
    year: '',
    dateTime: '',
    tradesField: '',
    reportType: '',
    harassmentType: '',
    severity: '',
    description: '',
    documentation: '',
    witnesses: '',
    individualsInvolved: '',
    actionsTaken: '',
  });
  const ref = React.useRef<TriggerRef>(null);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  function onTouchStart() {
    ref.current?.open();
  }

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={styles.pageContainer}>
        <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContentContainer}>
            <AppText
              weight="bold"
              style={{ fontSize: 24, color: 'white', marginBottom: 20, textAlign: 'center' }}>
              Create Report
            </AppText>
            <View style={{ marginBottom: 8 }}>
              <AppText weight="medium" style={styles.label}>
                Date
              </AppText>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Month" />
                  </SelectTrigger>
                  <SelectContent insets={contentInsets} className="w-[180px]">
                    <SelectGroup>
                      <SelectLabel>Months</SelectLabel>
                      {months.map((month) => (
                        <SelectItem key={month.value} label={month.label} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="DD"
                  style={styles.inputDay}
                  placeholderTextColor="#6B6B6B"
                  value={formData.day}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={(value) => setFormData({ ...formData, day: value })}
                />
                <Input
                  placeholder="YYYY"
                  style={styles.inputDay}
                  placeholderTextColor="#6B6B6B"
                  value={formData.year}
                  keyboardType="numeric"
                  maxLength={4}
                  onChangeText={(value) => setFormData({ ...formData, year: value })}
                />
              </View>
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
                Time
              </AppText>
              <Input
                placeholder="Time"
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.dateTime}
                keyboardType="numeric"
                onChangeText={(value) => setFormData({ ...formData, dateTime: value })}
              />
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
                  value={formData.reportType}
                  onChangeText={(value) => setFormData({ ...formData, reportType: value })}
                />
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
                value={formData.tradesField}
                onChangeText={(value) => setFormData({ ...formData, tradesField: value })}
              />
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
          </ScrollView>
        </Pressable>
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
    padding: 16,
    paddingBottom: 66,
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
});
