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
  centerOnReport: (latitude: number, longitude: number) => void;
};

type PublicReport = {
  id: string;
  title: string;
  location?: string;
  coordinates?: [number, number];
};

type MapOnHomeProps = ViewProps & {
  onAddressChange?: (address: string) => void;
  publicReports?: PublicReport[];
  onReportMarkerPress?: (reportId: string) => void;
};

const MapOnHome = forwardRef<MapOnHomeImperativeHandle, MapOnHomeProps>(function MapOnHome(
  { style, onAddressChange, publicReports = [], onReportMarkerPress },
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
    centerOnReport(latitude: number, longitude: number) {
      const targetRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(targetRegion, 750);
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

      // Set initial region only once, don't auto-update
      const initialRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
      setUserCoords({ latitude, longitude });

      // Watch position only to update user marker, NOT the map region
      // This allows the marker to move while user can pan/zoom freely
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 1,
          timeInterval: 1000,
        },
        (newLocation) => {
          const { latitude, longitude } = newLocation.coords;
          // Only update marker position, not the map region
          setUserCoords({ latitude, longitude });
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

          {/* Public report markers */}
          {publicReports.map((report) => {
            if (!report.coordinates || report.coordinates.length !== 2) return null;
            const [latitude, longitude] = report.coordinates;
            // Validate coordinates
            if (
              isNaN(latitude) ||
              isNaN(longitude) ||
              latitude === 0 ||
              longitude === 0 ||
              Math.abs(latitude) > 90 ||
              Math.abs(longitude) > 180
            ) {
              return null;
            }
            return (
              <Marker
                key={report.id}
                coordinate={{ latitude, longitude }}
                title={report.title}
                description={report.location || 'Report Location'}
                anchor={{ x: 0.5, y: 1 }}
                onPress={() => {
                  // Center map on marker
                  const targetRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  };
                  mapRef.current?.animateToRegion(targetRegion, 750);
                  // Notify parent of marker press
                  onReportMarkerPress?.(report.id);
                }}>
                <MapPin size={38} fill="#eec8ffff" color="#8449DF" strokeWidth={0} />
              </Marker>
            );
          })}
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
