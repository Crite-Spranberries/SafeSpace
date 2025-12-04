import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Keyboard,
  Pressable,
  Platform,
} from 'react-native';
import { ArrowLeft, CircleX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useEffect, useMemo } from 'react';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Input } from '@/components/ui/Input';
import { getReportById, reportDataToStoredReport, updateReport } from '@/lib/reports';
import { ReportData, mergeReportData, createReportDataFromDate } from '@/lib/reportData';
import * as Location from 'expo-location';

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
    month?: string;
    day?: string;
    year?: string;
    time?: string;
    location?: string;
    tags?: string;
    report_type?: string;
    trades_field?: string;
    status?: string;
    description?: string;
    witnesses?: string;
    primaries_involved?: string;
    actions_taken?: string;
    reportData?: string; // Structured report data JSON
  }>();

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    locationCoords: [0, 0] as [number, number],
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
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState<boolean>(false);

  // Load report data from storage if id is provided
  useEffect(() => {
    const loadReportData = async () => {
      const idParam = typeof params.id === 'string' ? params.id : null;
      if (idParam) {
        try {
          const report = await getReportById(idParam);
          if (report && report.reportData) {
            // Merge with defaults to ensure full ReportData
            const fullReportData = mergeReportData(report.reportData);
            setReportData(fullReportData);

            // Initialize form with report data
            const rd = fullReportData;
            const monthNames = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            const monthIndex = monthNames.indexOf(rd.month || 'January');
            const timeValue = rd.time || 0;
            const hours = Math.floor(timeValue / 100);
            const minutes = timeValue % 100;
            const reportDate = new Date(
              rd.year || new Date().getFullYear(),
              monthIndex,
              rd.day || 1,
              hours,
              minutes
            );

            setDate(reportDate && !isNaN(reportDate.getTime()) ? reportDate : new Date());
            setFormData({
              title: rd.report_title || '',
              location: rd.location_name || '',
              locationCoords: rd.location_coords || [0, 0],
              tradesFieldInput: '',
              tradesFieldArray: rd.trades_field || [],
              reportFieldInput: '',
              reportFieldArray: rd.report_type || [],
              description: rd.report_desc || '',
              witnessesInput: '',
              witnessesArray: rd.witnesses || [],
              primariesInput: '',
              primariesArray: rd.primaries_involved || [],
              actionsInput: '',
              actionsArray: rd.actions_taken || [],
            });
          }
        } catch (err) {
          console.error('Failed to load report:', err);
        }
      } else {
        // Fallback to params if no id
        const parseArrayParam = (param: string | undefined): string[] => {
          if (!param) return [];
          try {
            const parsed = JSON.parse(param);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        };

        // Initialize date from params
        let initialDate = new Date();
        if (params.month && params.day && params.year && params.time) {
          try {
            const year = parseInt(params.year);
            const day = parseInt(params.day);
            const time = parseInt(params.time);
            const monthNames = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            const monthIndex = monthNames.indexOf(params.month);
            if (monthIndex !== -1 && !isNaN(year) && !isNaN(day) && !isNaN(time)) {
              const hours = Math.floor(time / 100);
              const minutes = time % 100;
              initialDate = new Date(year, monthIndex, day, hours, minutes);
            }
          } catch (e) {
            console.log('Error parsing date:', e);
          }
        }

        // Parse coordinates from reportData if available
        let initialCoords: [number, number] = [0, 0];
        if (params.reportData) {
          try {
            const parsed = JSON.parse(params.reportData as string);
            if (
              parsed.location_coords &&
              Array.isArray(parsed.location_coords) &&
              parsed.location_coords.length === 2
            ) {
              const lat =
                typeof parsed.location_coords[0] === 'number'
                  ? parsed.location_coords[0]
                  : parseFloat(parsed.location_coords[0]) || 0;
              const lng =
                typeof parsed.location_coords[1] === 'number'
                  ? parsed.location_coords[1]
                  : parseFloat(parsed.location_coords[1]) || 0;
              if (lat !== 0 || lng !== 0) {
                initialCoords = [lat, lng];
              }
            }
          } catch (e) {
            console.log('Error parsing coordinates from reportData:', e);
          }
        }

        setDate(initialDate);
        setFormData({
          title: typeof params.title === 'string' ? params.title : '',
          location: typeof params.location === 'string' ? params.location : '',
          locationCoords: initialCoords,
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
        });
      }
      setIsLoading(false);
    };

    loadReportData();
  }, [params.id]);

  // Get user's current location on mount (as fallback)
  useEffect(() => {
    const getCurrentLocation = async () => {
      // Check if we already have a valid location
      if (
        formData.location &&
        formData.locationCoords[0] !== 0 &&
        formData.locationCoords[1] !== 0
      ) {
        return; // Already have location
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;

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
        }
      } catch (err) {
        console.warn('Failed to get current location', err);
      }
    };

    if (!isLoading) {
      getCurrentLocation();
    }
  }, [isLoading, formData.location, formData.locationCoords]);

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
          const results = await Location.geocodeAsync(value);
          if (results && results.length > 0) {
            const suggestions = results.slice(0, 5).map((result: any) => {
              const parts = [];
              if (result.name) parts.push(result.name);
              if (result.street) parts.push(result.street);
              if (result.city) parts.push(result.city);
              if (result.region) parts.push(result.region);
              return parts.join(', ') || value;
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
      }, 300);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle pressing enter on location input
  const handleLocationSubmit = () => {
    if (locationSuggestions.length > 0) {
      handleLocationSelect(locationSuggestions[0]);
    } else if (formData.location.trim().length > 0) {
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
          location: fullAddress,
          locationCoords: coords,
        });
      } else {
        setFormData({
          ...formData,
          location: selectedLocation,
        });
      }
    } catch (err) {
      console.warn('Failed to geocode selected location', err);
      setFormData({
        ...formData,
        location: selectedLocation,
      });
    } finally {
      setIsGeocoding(false);
    }
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

  const handleSave = async () => {
    try {
      const idParam = typeof params.id === 'string' ? params.id : null;

      // Ensure date is valid
      const validDate = date && !isNaN(date.getTime()) ? date : new Date();

      // Parse date and time
      const month = validDate.toLocaleString('default', { month: 'long' });
      const day = validDate.getDate();
      const year = validDate.getFullYear();
      const hours = validDate.getHours();
      const minutes = validDate.getMinutes();
      const timeValue = hours * 100 + minutes;

      // Merge with existing reportData if available
      const baseData = reportData
        ? mergeReportData(reportData)
        : mergeReportData(createReportDataFromDate(validDate));

      // Build complete ReportData object
      const updatedReportData = mergeReportData(
        {
          report_title: formData.title || baseData.report_title || 'Incident Report',
          month,
          day,
          year,
          time: timeValue,
          location_name: formData.location || '',
          location_coords:
            formData.locationCoords[0] !== 0 && formData.locationCoords[1] !== 0
              ? formData.locationCoords
              : baseData.location_coords,
          report_type: formData.reportFieldArray,
          trades_field: formData.tradesFieldArray,
          report_desc: formData.description,
          primaries_involved: formData.primariesArray,
          witnesses: formData.witnessesArray,
          actions_taken: formData.actionsArray,
          report_method: 'manual_form',
          isPublic: baseData.isPublic || false,
        },
        baseData
      );

      // Preserve report_id if updating
      if (idParam) {
        updatedReportData.report_id = idParam;
      }

      // Convert to StoredReport and save
      const payload = reportDataToStoredReport(updatedReportData, updatedReportData.report_id);

      if (idParam) {
        // Update existing report
        await updateReport(idParam, payload);
        Alert.alert('Success', 'Report saved successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        // Editing before report is created - return data back to report screen
        // Format time in 12-hour format with AM/PM
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${formattedHours}:${String(minutes).padStart(2, '0')} ${ampm}`;

        router.push({
          pathname: '/create_report/report',
          params: {
            reportData: JSON.stringify(updatedReportData),
            reportTitle: formData.title || 'Incident Report',
            location: formData.location || '',
            date: validDate.toLocaleDateString(),
            time: formattedTime,
            reportType: JSON.stringify(formData.reportFieldArray),
            tradesField: JSON.stringify(formData.tradesFieldArray),
            description: formData.description,
            witnesses: JSON.stringify(formData.witnessesArray),
            individualsInvolved: JSON.stringify(formData.primariesArray),
            actionsTaken: JSON.stringify(formData.actionsArray),
          },
        });
      }
    } catch (e) {
      console.error('Failed to save report:', e);
      Alert.alert('Error', 'Failed to save report. Please try again.');
    }
  };

  // All hooks must be called before any conditional returns
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
    left: 12,
    right: 12,
  };

  if (isLoading) {
    return (
      <>
        <LinearGradient
          colors={['#371F5E', '#000']}
          locations={[0, 0.3]}
          style={styles.background}
        />
        <Stack.Screen options={SCREEN_OPTIONS} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText style={{ color: '#FFFFFF' }}>Loading...</AppText>
        </SafeAreaView>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <LinearGradient
          colors={['#371F5E', '#000']}
          locations={[0, 0.3]}
          style={styles.background}
        />
        <Stack.Screen options={SCREEN_OPTIONS} />
        <SafeAreaView style={styles.pageContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <AppText style={{ color: '#FFFFFF' }}>Loading...</AppText>
          </View>
        </SafeAreaView>
      </>
    );
  }

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
              Edit Report
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
              {/* Show map if we have coordinates */}
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
        <Button variant="purple" radius="full" style={styles.buttonContainer} onPress={handleSave}>
          <AppText weight="medium" style={styles.buttonText}>
            {typeof params.id === 'string' ? 'Save Changes' : 'Save & Regenerate Report'}
          </AppText>
        </Button>
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
  pageContainer: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 24,
  },
  label: {
    color: 'white',
    fontSize: 16,
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
  buttonContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    height: 52,
  },
  buttonText: {
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
