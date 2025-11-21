import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import MapView, { Marker, Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native'; // your SVG icon
import { Locate } from 'lucide-react-native';
import * as Location from 'expo-location';

const customMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#222222' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#cccccc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#141414' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#6c6c6c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2e3a4b' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#171c18' }] },

  // Hide all POI labels and icons
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
];

const MapOnHome: React.FC<{ style?: object; onAddressChange?: (address: string) => void }> = ({
  style,
  onAddressChange,
}) => {
  const [userAddress, setUserAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get initial position and address
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      let [geo] = await Location.reverseGeocodeAsync(location.coords);
      const address = geo.name
        ? `${geo.name}, ${geo.city}, ${geo.region}`
        : `${geo.city}, ${geo.region}`;
      setUserAddress(address);
      onAddressChange?.(address);

      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setUserCoords({ latitude, longitude });

      // Subscribe for continuous updates
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
  }, []);

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {region && (
        <MapView
          style={StyleSheet.absoluteFill}
          provider="google"
          region={region}
          customMapStyle={customMapStyle}
          showsUserLocation={false} // custom marker used
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapOnHome;
