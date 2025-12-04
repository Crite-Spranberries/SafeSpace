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
    (async () => {
      // If coordinates are provided, use them (for report location)
      if (coordinates && coordinates.length === 2 && coordinates[0] !== 0 && coordinates[1] !== 0) {
        const [latitude, longitude] = coordinates;

        // Reverse geocode to get address from coordinates
        try {
          let [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
          const addr = geo.name
            ? `${geo.name}, ${geo.city}, ${geo.region}`
            : geo.city
              ? `${geo.city}, ${geo.region}`
              : address; // Fallback to provided address
          setDisplayAddress(addr);
        } catch (err) {
          console.warn('Failed to reverse geocode', err);
          setDisplayAddress(address);
        }

        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setMarkerCoords({ latitude, longitude });
        return; // Don't watch position if we have coordinates
      }

      // Otherwise, get current location (for home page or when no coordinates provided)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setDisplayAddress(address);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let [geo] = await Location.reverseGeocodeAsync(location.coords);
      const addr = geo.name
        ? `${geo.name}, ${geo.city}, ${geo.region}`
        : `${geo.city}, ${geo.region}`;
      setDisplayAddress(addr);

      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setMarkerCoords({ latitude, longitude });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setMarkerCoords({ latitude, longitude });
          setRegion((prevRegion) => ({
            ...prevRegion!,
            latitude,
            longitude,
          }));
        }
      );
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
              <MapPin size={40} fill="#8449DF" color="#8449DF" strokeWidth={0} />
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
