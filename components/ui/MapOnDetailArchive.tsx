import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, Expand } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';

const MapOnDetail: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location</Text>

      <View style={styles.card}>
        <ImageBackground
          source={require('@/assets/images/map-placeholder.png')}
          style={styles.mapArea}
          imageStyle={styles.mapImage}>
          {/* Purple translucent radius */}
          <View style={styles.radius} />

          {/* Pin (lucide icon) */}
          <MapPin color="#5E349E" size={30} strokeWidth={1.5} style={styles.pin} />

          {/* Expand icon top-right */}
          <TouchableOpacity style={styles.expandButton} activeOpacity={0.8}>
            <View style={styles.expandInner}>
              <Icon as={Expand} color="#5E349E" size={16} />
            </View>
          </TouchableOpacity>
        </ImageBackground>

        {/* Address bar */}
        <View style={styles.addressBar}>
          <Text style={styles.addressText}>BCIT Burnaby Campus, Burnaby</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 8,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0f1724',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  mapArea: {
    height: 160,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  radius: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(124,58,237,0.22)',
  },
  pin: {
    position: 'absolute',
    top: '60%',
    left: '50%',
    marginLeft: -15,
    marginTop: -34,
  },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  expandInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '700',
  },
  addressBar: {
    backgroundColor: '#5c3d8a',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  addressText: {
    color: '#e6e6e6',
    fontSize: 16,
  },
});

export default MapOnDetail;
