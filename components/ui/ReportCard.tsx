import React from 'react';
import { View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Heart, MessageCircleMore, ArrowRight } from 'lucide-react-native';
import { AppText } from './AppText';

type ReportCardProps = {
  tags?: string[];
  title: string;
  location?: string;
  excerpt?: string;
  image?: ImageSourcePropType;
  likes?: number;
  comments?: number;
  onPress?: () => void;
  onDetailsPress?: () => void;
};

export default function ReportCard({
  tags = [],
  title,
  location,
  excerpt,
  likes = 0,
  comments = 0,
  onPress,
  onDetailsPress,
}: ReportCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.topBlock}>
          <AppText style={styles.tags}>{tags.join(', ')}</AppText>
        </View>

        <AppText style={styles.title} weight="medium">{title}</AppText>
        {location ? <AppText style={styles.location} >{location}</AppText> : null}

        {excerpt ? (
          <AppText numberOfLines={3} ellipsizeMode="tail" style={styles.excerpt}>
            {excerpt}
          </AppText>
        ) : null}

        <View style={styles.rowBottom}>
          <View style={styles.leftGroup}>
            <View style={styles.iconText}>
              <Icon as={Heart} color="#6B6B6B" size={20} strokeWidth={2.6} />
              <AppText style={styles.countText}>{likes}</AppText>
            </View>
            <View style={[styles.iconText, { marginLeft: 12 }]}>
              <Icon as={MessageCircleMore} color="#6B6B6B" size={20} strokeWidth={2.6} />
              <AppText style={styles.countText}>{comments}</AppText>
            </View>
          </View>

          <TouchableOpacity style={styles.detailsBtn} onPress={onDetailsPress} activeOpacity={0.8}>
            <AppText style={styles.detailsText} weight="medium">Details</AppText>
            <Icon as={ArrowRight} color="#5E349E" size={18}  strokeWidth={2.6}/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 'auto',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  topBlock: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  tags: {
    color: '#5E349E',
    fontSize: 16,
  },
  title: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 24,
    marginBottom: 8,
  },
  location: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 16,
  },
  excerpt: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 16,
  },
  rowBottom: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    color: '#6B6B6B',
    fontSize: 16,
    marginLeft: 4,
    lineHeight: 20,
  },
  detailsBtn: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    color: '#5E349E',
    fontSize: 14,
    lineHeight: 18,
  },
});
