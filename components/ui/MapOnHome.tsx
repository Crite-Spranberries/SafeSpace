import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const customMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#222222' }] }, // dark background
  { elementType: 'labels.text.fill', stylers: [{ color: '#cccccc' }] }, // light gray text
  { elementType: 'labels.text.stroke', stylers: [{ color: '#141414' }] }, // dark text outline
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#505050' }] }, // medium gray roads
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2e3a4b' }] }, // muted blue water
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#171c18' }] }, // dark landscape
];

const MapOnHome: React.FC = () => {
  const [userAddress, setUserAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      let [geo] = await Location.reverseGeocodeAsync(location.coords);
      setUserAddress(
        geo.name ? `${geo.name}, ${geo.city}, ${geo.region}` : `${geo.city}, ${geo.region}`
      );
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setUserCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.mapArea}
          provider="google"
          region={region}
          customMapStyle={customMapStyle}>
          {userCoords && (
            <Marker
              coordinate={userCoords}
              pinColor="#a70df4f"
              title="You are here"
              description={userAddress}
            />
          )}
        </MapView>
      )}
      <View style={styles.addressBar}>
        <AppText style={styles.addressText}>
          {errorMsg ? errorMsg : userAddress ? userAddress : 'Fetching current location...'}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mapArea: {
    height: 123,
    width: '100%',
  },
  addressBar: {
    backgroundColor: '#F3EDFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addressText: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 20,
  },
});

export default MapOnHome;
