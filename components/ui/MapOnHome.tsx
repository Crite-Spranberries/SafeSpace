import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { AppText } from './AppText';
import MapView, { Marker, Region } from 'react-native-maps';
import { MapPin } from 'lucide-react-native';
import * as Location from 'expo-location';

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

export type MapOnHomeImperativeHandle = {
  centerOnUser: () => void;
};

type MapOnHomeProps = ViewProps & {
  onAddressChange?: (address: string) => void;
};

const MapOnHome = forwardRef<MapOnHomeImperativeHandle, MapOnHomeProps>(function MapOnHome(
  { style, onAddressChange },
  ref: ForwardedRef<MapOnHomeImperativeHandle>
) {
  const [userAddress, setUserAddress] = useState('');
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    centerOnUser() {
      if (userCoords) {
        const targetRegion = {
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(targetRegion, 750);
      }
    },
  }));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
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

      Location.watchPositionAsync(
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
      // Cleanup subscription
    };
  }, []);

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      {region && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider="google"
          region={region}
          customMapStyle={customMapStyle}
          showsUserLocation={false}
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
          <Marker
            coordinate={{ latitude: 49.248134, longitude: -123.002985 }}
            title="BCIT - Fairey Street"
            description="Near Fairey St, Burnaby"
            anchor={{ x: 0.5, y: 1 }}>
            <MapPin size={38} fill="#eec8ffff" color="#FF6B00" strokeWidth={0} />
          </Marker>

          <Marker
            coordinate={{ latitude: 49.250885, longitude: -123.001985 }}
            title="BCIT - Lister Avenue"
            description="Near Lister Ave, Burnaby"
            anchor={{ x: 0.5, y: 1 }}>
            <MapPin size={38} fill="#eec8ffff" color="#00CFFF" strokeWidth={0} />
          </Marker>
        </MapView>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapOnHome;
