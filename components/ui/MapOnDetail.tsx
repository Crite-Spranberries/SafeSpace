import { AppText } from '@/components/ui/AppText';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';

type MapOnDetailProps = {
  address?: string;
  style?: StyleProp<ViewStyle>;
};

export default function MapOnDetail({
  address = '3700 Willingdon Avenue, Burnaby',
  style,
}: MapOnDetailProps) {
  return (
    <View style={[styles.container, style]}>
      <AppText style={styles.locationTitle} weight="medium">
        Location
      </AppText>
      <AppText style={styles.locationAddress}>{address}</AppText>
      <Image style={styles.mapImage} source={require('@/assets/images/map-placeholder.png')} />
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
  mapImage: {
    width: '100%',
    height: 148,
    borderRadius: 8,
  },
});
