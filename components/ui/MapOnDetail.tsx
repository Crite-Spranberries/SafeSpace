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
  style?: StyleProp<ViewStyle>;
};

export default function MapOnDetail({
  address = '3700 Willingdon Avenue, Burnaby',
  style,
}: MapOnDetailProps) {
  const [userAddress, setUserAddress] = useState(address);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setUserAddress(address);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let [geo] = await Location.reverseGeocodeAsync(location.coords);
      const addr = geo.name
        ? `${geo.name}, ${geo.city}, ${geo.region}`
        : `${geo.city}, ${geo.region}`;
      setUserAddress(addr);

      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setUserCoords({ latitude, longitude });

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          setUserCoords({ latitude, longitude });
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
  }, [address]);

  return (
    <View style={[styles.container, style]}>
      <AppText style={styles.locationTitle} weight="medium">
        Location
      </AppText>
      <AppText style={styles.locationAddress}>{userAddress}</AppText>
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
          {userCoords && (
            <Marker
              coordinate={userCoords}
              title="You are here"
              description={userAddress}
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
