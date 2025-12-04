import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';
import { AppText } from '@/components/ui/AppText';

const customMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#cccccc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#141414' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#6c6c6c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2e3a4b' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#171c18' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
];

type MapOnDetailProps = {
  address?: string;
  coordinates?: [number, number]; // [latitude, longitude] from location_coords
  style?: StyleProp<ViewStyle>;
};

export default function MapOnDetail({
  address = '3700 Willingdon Avenue, Burnaby',
  coordinates,
  style,
}: MapOnDetailProps) {
  const [displayAddress, setDisplayAddress] = useState(address);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [markerCoords, setMarkerCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    // Stop any existing location watcher first
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    (async () => {
      console.log('MapOnDetail useEffect triggered', {
        hasCoordinates: !!coordinates,
        coordinates,
        address,
        coordinatesType: typeof coordinates,
        isArray: Array.isArray(coordinates),
      });

      // If coordinates are provided, use them (for report location)
      // Check if coordinates are valid (not null, array of 2, and not [0, 0])
      const hasValidCoordinates =
        coordinates !== undefined &&
        coordinates !== null &&
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number' &&
        !isNaN(coordinates[0]) &&
        !isNaN(coordinates[1]) &&
        !(coordinates[0] === 0 && coordinates[1] === 0) &&
        Math.abs(coordinates[0]) <= 90 && // Valid latitude range
        Math.abs(coordinates[1]) <= 180; // Valid longitude range

      const coord0 = Array.isArray(coordinates) ? coordinates[0] : undefined;
      const coord1 = Array.isArray(coordinates) ? coordinates[1] : undefined;
      console.log('MapOnDetail coordinate validation:', {
        hasValidCoordinates,
        coordinates,
        checks: {
          notUndefined: coordinates !== undefined,
          notNull: coordinates !== null,
          isArray: Array.isArray(coordinates),
          length2: Array.isArray(coordinates) && coordinates.length === 2,
          bothNumbers: typeof coord0 === 'number' && typeof coord1 === 'number',
          notNaN:
            typeof coord0 === 'number' &&
            typeof coord1 === 'number' &&
            !isNaN(coord0) &&
            !isNaN(coord1),
          notZeroZero:
            typeof coord0 === 'number' &&
            typeof coord1 === 'number' &&
            !(coord0 === 0 && coord1 === 0),
          validLat: typeof coord0 === 'number' && Math.abs(coord0) <= 90,
          validLng: typeof coord1 === 'number' && Math.abs(coord1) <= 180,
        },
      });

      if (hasValidCoordinates) {
        const [latitude, longitude] = coordinates;
        console.log('MapOnDetail: Using provided coordinates', { latitude, longitude });

        // Reverse geocode to get address from coordinates, but prefer the provided address if available
        // The provided address (from location_name) is likely more accurate than reverse geocoding
        if (address && address.trim().length > 0 && address !== 'Location not specified') {
          setDisplayAddress(address);
        } else {
          // Only reverse geocode if no address was provided
          try {
            let [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
            const addr = geo.name
              ? `${geo.name}, ${geo.city}, ${geo.region}`
              : geo.city
                ? `${geo.city}, ${geo.region}`
                : 'Location not specified';
            setDisplayAddress(addr);
          } catch (err) {
            console.warn('Failed to reverse geocode', err);
            setDisplayAddress('Location not specified');
          }
        }

        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setMarkerCoords({ latitude, longitude });
        console.log('MapOnDetail: Set region and marker to coordinates', initialRegion);
        return; // Don't watch position if we have coordinates
      }

      // MapOnDetail should NEVER get current location - it only shows report coordinates
      // If no valid coordinates, just show the address without a map
      console.log('MapOnDetail: No valid coordinates provided - showing address only (no map)');
      setDisplayAddress(address || 'Location not specified');
      // Don't set region or marker - no map will be shown
    })();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [address, coordinates]);

  return (
    <View style={[styles.container, style]}>
      <AppText style={styles.locationTitle} weight="medium">
        Location
      </AppText>
      <AppText style={styles.locationAddress}>{displayAddress}</AppText>
      {region && (
        <MapView
          style={styles.mapView}
          provider="google"
          region={region}
          customMapStyle={customMapStyle}
          showsUserLocation={false}
          zoomEnabled={true}
          scrollEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}>
          {markerCoords && (
            <Marker
              coordinate={markerCoords}
              title={coordinates ? 'Report Location' : 'You are here'}
              description={displayAddress}
              anchor={{ x: 0.5, y: 1 }}>
              <MapPin size={38} fill="#eec8ffff" color="#8449DF" strokeWidth={0} />
            </Marker>
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '100%',
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  locationAddress: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  mapView: {
    width: '100%',
    height: 148,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
  },
});
