import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { AppText } from './AppText';

const MapOnHome: React.FC = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/map-placeholder.png')}
        style={styles.mapArea}
        imageStyle={styles.mapImage}>
        <MapPin color="#5E349E" size={24} strokeWidth={2.6} style={styles.pinA} />
        <MapPin color="#5E349E" size={24} strokeWidth={2.6} style={styles.pinB} />
        <MapPin color="#5E349E" size={24} strokeWidth={2.6} style={styles.pinC} />
      </ImageBackground>

      <View style={styles.addressBar}>
        <AppText style={styles.addressText}>BCIT, Burnaby</AppText>
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
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pinA: {
    position: 'absolute',
    left: '33.5%',
    top: '55.5%',
    marginLeft: -12,
    marginTop: -12,
  },
  pinB: {
    position: 'absolute',
    left: '43%',
    top: '46%',
    marginLeft: -12,
    marginTop: -12,
  },
  pinC: {
    position: 'absolute',
    left: '64%',
    top: '62%',
    marginLeft: -12,
    marginTop: -12,
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
