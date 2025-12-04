import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from './AppText';
import { Pressable } from 'react-native';

type RecordingCardProps = {
  tags?: string[];
  title: string;
  location?: string;
  date?: string;
  timestamp?: string;
  duration?: string;
  onDetailsPress?: () => void;
};

export default function RecordingCard({
  tags = [],
  title,
  location,
  date,
  timestamp,
  duration = '0:00',
  onDetailsPress,
}: RecordingCardProps) {
  return (
    <Pressable onPress={onDetailsPress}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          {tags.length > 0 && (
            <View style={styles.topBlock}>
              <View style={styles.tagsContainer}>
                <AppText style={styles.tags} numberOfLines={1} ellipsizeMode="tail">
                  {tags.join(', ')}
                </AppText>
              </View>
              <AppText style={styles.duration}>{duration}</AppText>
            </View>
          )}

          <AppText numberOfLines={1} style={styles.title} weight="medium">
            {title}
          </AppText>
          {location ? <AppText style={styles.location}>{location}</AppText> : null}
          <View style={styles.bottomRow}>
            {date ? <AppText style={styles.date}>{date}</AppText> : null}
            {timestamp ? <AppText style={styles.timestamp}>{timestamp}</AppText> : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  topBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  tagsContainer: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0, // Allows flexbox to shrink below content size
  },
  tags: {
    color: '#5E349E',
    fontSize: 16,
    lineHeight: 20,
  },
  duration: {
    color: '#5E349E',
    fontSize: 16,
    lineHeight: 20,
    flexShrink: 0, // Prevent duration from shrinking
  },
  title: {
    color: '#000000',
    fontSize: 20,
    lineHeight: 24,
  },
  location: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 16,
  },
  date: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    color: '#333333',
    fontSize: 16,
    lineHeight: 20,
  },
});
