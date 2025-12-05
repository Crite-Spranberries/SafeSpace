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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { ArrowLeft, CircleX } from 'lucide-react-native';
import React, { useState } from 'react';
import type { TriggerRef } from '@rn-primitives/select';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createReportDataFromDate } from '@/lib/reportData';
import * as Location from 'expo-location';

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

export default function Form() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    locationCoords: [0, 0] as [number, number],
    day: '',
    month: '',
    year: '',
    dateTime: '',
    tradesFieldInput: '',
    tradesFieldArray: [] as string[],
    reportFieldInput: '',
    reportFieldArray: [] as string[],
    description: '',
    witnessesInput: '',
    witnessesArray: [] as string[],
    primariesInput: '',
    primariesArray: [] as string[],
    actionsInput: '',
    actionsArray: [] as string[],
  });

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);

  // Get user's current location on mount
  React.useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;

          // Reverse geocode to get address
          let locationName = '';
          try {
            const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
            locationName = (geo as any).name
              ? `${(geo as any).name}, ${(geo as any).city}, ${(geo as any).region}`
              : (geo as any).city
                ? `${(geo as any).city}, ${(geo as any).region}`
                : '';
          } catch (geoErr) {
            console.warn('Failed to reverse geocode location', geoErr);
          }

          const userLoc = {
            name: locationName || 'Current Location',
            coords: [latitude, longitude] as [number, number],
          };
          setUserLocation(userLoc);
          // Set as default location if the form location is empty
          if (!formData.location) {
            setFormData({
              ...formData,
              location: userLoc.name,
              locationCoords: userLoc.coords,
            });
          }
        }
      } catch (err) {
        console.warn('Failed to get current location', err);
      }
    };

    getCurrentLocation();
  }, []); // Only run once on mount

  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

  // Handler for date picker
  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      const currentDate = date && !isNaN(date.getTime()) ? new Date(date) : new Date();
      // Update date parts but preserve time
      currentDate.setFullYear(selectedDate.getFullYear());
      currentDate.setMonth(selectedDate.getMonth());
      currentDate.setDate(selectedDate.getDate());
      setDate(currentDate);
    }
  };

  // Handler for time picker
  const onTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      const currentDate = date && !isNaN(date.getTime()) ? new Date(date) : new Date();
      // Update time parts but preserve date
      currentDate.setHours(selectedDate.getHours());
      currentDate.setMinutes(selectedDate.getMinutes());
      currentDate.setSeconds(0);
      currentDate.setMilliseconds(0);
      setDate(currentDate);
    }
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

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (str: string): string => {
    if (!str || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const capitalizeTag = (tag: string): string => {
    // Handle multi-word tags (e.g., "Anti-LGBTQ+ Discrimination")
    return tag
      .split(/[\s-]+/)
      .map((word) => capitalizeFirstLetter(word))
      .join(tag.includes('-') ? '-' : ' ');
  };

  const handleAddTradesField = () => {
    const input = formData.tradesFieldInput.trim();
    if (input === '') return;

    const capitalized = capitalizeTag(input);
    setFormData({
      ...formData,
      tradesFieldArray: [...formData.tradesFieldArray, capitalized],
      tradesFieldInput: '',
    });
  };

  const handleAddReportField = () => {
    const input = formData.reportFieldInput.trim();
    if (input === '') return;

    const capitalized = capitalizeTag(input);
    setFormData({
      ...formData,
      reportFieldArray: [...formData.reportFieldArray, capitalized],
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

  // Debounce timer for location autocomplete
  const locationDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle location input with autocomplete
  const handleLocationChange = async (value: string) => {
    setFormData({ ...formData, location: value });
    setShowSuggestions(false);

    // Clear existing debounce
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current);
    }

    if (value.trim().length > 2) {
      // Debounce geocoding requests
      locationDebounceRef.current = setTimeout(async () => {
        try {
          // Use expo-location geocoding for suggestions
          const results = await Location.geocodeAsync(value);
          if (results && results.length > 0) {
            const suggestions = results.slice(0, 5).map((result: any) => {
              const parts = [];
              // expo-location geocode results have these properties
              if (result.name) parts.push(result.name);
              if (result.street) parts.push(result.street);
              if (result.city) parts.push(result.city);
              if (result.region) parts.push(result.region);
              return parts.join(', ') || value; // Fallback to input value if no parts
            });
            setLocationSuggestions(suggestions);
            setShowSuggestions(true);
          } else {
            setLocationSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (err) {
          console.warn('Geocoding error:', err);
          setLocationSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300); // 300ms debounce
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle pressing enter on location input - select first/closest suggestion
  const handleLocationSubmit = () => {
    if (locationSuggestions.length > 0) {
      handleLocationSelect(locationSuggestions[0]);
    } else if (formData.location.trim().length > 0) {
      // Try to geocode the current input
      handleLocationSelect(formData.location);
    }
  };

  // Handle location selection
  const handleLocationSelect = async (selectedLocation: string) => {
    setShowSuggestions(false);
    setIsGeocoding(true);

    try {
      const results = await Location.geocodeAsync(selectedLocation);
      if (results && results.length > 0) {
        const result = results[0];
        const coords: [number, number] = [result.latitude, result.longitude];

        // Build full address from geocoded result
        const parts = [];
        if ((result as any).name) parts.push((result as any).name);
        if ((result as any).street) parts.push((result as any).street);
        if ((result as any).city) parts.push((result as any).city);
        if ((result as any).region) parts.push((result as any).region);
        const fullAddress = parts.length > 0 ? parts.join(', ') : selectedLocation;

        setFormData({
          ...formData,
          location: fullAddress, // Use the full geocoded address
          locationCoords: coords,
        });
      } else {
        // If geocoding fails, still set the location text
        setFormData({
          ...formData,
          location: selectedLocation,
        });
      }
    } catch (err) {
      console.warn('Failed to geocode selected location', err);
      // On error, still set the location text
      setFormData({
        ...formData,
        location: selectedLocation,
      });
    } finally {
      setIsGeocoding(false);
    }
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
                Report Title
              </AppText>
              <Input
                placeholder="Enter a title for this report..."
                style={styles.input}
                placeholderTextColor="#6B6B6B"
                value={formData.title}
                onChangeText={(value) => setFormData({ ...formData, title: value })}
              />
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
                Date and Time
              </AppText>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <DateTimePicker
                  testID="datePicker"
                  value={date && !isNaN(date.getTime()) ? date : new Date()}
                  mode="date"
                  onChange={onDateChange}
                  accentColor="white"
                />
                <DateTimePicker
                  testID="timePicker"
                  value={date && !isNaN(date.getTime()) ? date : new Date()}
                  mode="time"
                  onChange={onTimeChange}
                  is24Hour={true}
                  accentColor="white"
                />
              </View>
            </View>
            <View>
              <AppText weight="medium" style={styles.label}>
                Location
              </AppText>
              <View style={{ position: 'relative', marginBottom: 12 }}>
                <Input
                  placeholder="Search for a location..."
                  style={styles.input}
                  placeholderTextColor="#6B6B6B"
                  value={formData.location}
                  onChangeText={handleLocationChange}
                  onSubmitEditing={handleLocationSubmit}
                  returnKeyType="search"
                  onFocus={() => {
                    if (locationSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow selection
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    {locationSuggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => handleLocationSelect(suggestion)}>
                        <AppText style={styles.suggestionText}>{suggestion}</AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Show map if we have coordinates (either from selected location or user's default location) */}
              {((formData.locationCoords[0] !== 0 && formData.locationCoords[1] !== 0) ||
                (userLocation && (!formData.location || formData.locationCoords[0] === 0))) && (
                <MapOnDetail
                  coordinates={
                    formData.locationCoords[0] !== 0 && formData.locationCoords[1] !== 0
                      ? formData.locationCoords
                      : userLocation?.coords || [0, 0]
                  }
                  address={formData.location || userLocation?.name || 'Current Location'}
                  style={{ marginBottom: 16, marginTop: 12 }}
                />
              )}
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
              <AppText weight="medium" style={styles.label}>
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
              <AppText weight="medium" style={styles.label}>
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
          </Pressable>
        </ScrollView>
        <Button
          variant="purple"
          radius="full"
          style={styles.buttonContainer}
          onPress={() => {
            // Ensure date is valid - use current date if invalid
            let validDate: Date;
            if (date && !isNaN(date.getTime()) && date instanceof Date) {
              validDate = date;
            } else {
              validDate = new Date();
              setDate(validDate); // Update state to valid date
            }

            // Create structured ReportData from the form data
            // This will be used as initial data, AI will generate the full report on the next page
            const baseReportData = createReportDataFromDate(validDate);

            // Format time properly - ensure no NaN
            const hours = validDate.getHours();
            const minutes = validDate.getMinutes();
            // Ensure hours and minutes are valid numbers
            const validHours = isNaN(hours) ? new Date().getHours() : hours;
            const validMinutes = isNaN(minutes) ? new Date().getMinutes() : minutes;
            const timeValue = validHours * 100 + validMinutes; // Format: HHMM (e.g., 1430 for 2:30 PM)

            const reportData = {
              ...baseReportData,
              report_title: formData.title || 'Incident Report',
              location_name: formData.location || '',
              location_coords: formData.locationCoords,
              report_type: formData.reportFieldArray,
              trades_field: formData.tradesFieldArray,
              report_desc: formData.description, // Initial description, will be enhanced by AI
              report_transcript: formData.description, // Use description as transcript for manual reports
              primaries_involved: formData.primariesArray,
              witnesses: formData.witnessesArray,
              actions_taken: formData.actionsArray,
              recommended_actions: [], // Will be generated by AI
              time: timeValue, // Ensure time is properly formatted
            };

            router.push({
              pathname: '/create_report/report',
              params: {
                reportData: JSON.stringify(reportData),
                // Keep legacy params for backward compatibility
                reportTitle: formData.title || 'Incident Report',
                location: formData.location || '',
                date: (() => {
                  // Format date safely - ensure it's valid
                  try {
                    const dateStr = validDate.toLocaleDateString();
                    if (dateStr && dateStr !== 'Invalid Date') {
                      return dateStr;
                    }
                  } catch (e) {
                    console.warn('Date formatting error:', e);
                  }
                  // Fallback to today's date
                  return new Date().toLocaleDateString();
                })(),
                time: (() => {
                  const hours12 = validHours % 12 || 12;
                  const ampm = validHours >= 12 ? 'PM' : 'AM';
                  return `${hours12}:${String(validMinutes).padStart(2, '0')} ${ampm}`;
                })(),
                reportType: JSON.stringify(formData.reportFieldArray),
                tradesField: JSON.stringify(formData.tradesFieldArray),
                description: formData.description,
                witnesses: JSON.stringify(formData.witnessesArray),
                individualsInvolved: JSON.stringify(formData.primariesArray),
                actionsTaken: JSON.stringify(formData.actionsArray),
              },
            });
          }}>
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
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#FFFFFF4D',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF1A',
  },
  suggestionText: {
    color: '#FFF',
    fontSize: 16,
  },
});
