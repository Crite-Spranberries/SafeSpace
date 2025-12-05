import React from 'react';
import { View, StyleSheet, ImageSourcePropType, Pressable } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { Globe, EyeOff, PenLine, X } from 'lucide-react-native';
import { AppText } from './AppText';

type ReportCardProps = {
  tags?: string[];
  title: string;
  location?: string;
  excerpt?: string;
  date?: string;
  timestamp?: string;
  image?: ImageSourcePropType;
  onDetailsPress?: () => void;
  /** Optional status in the top-right (for myLogs) */
  status?: 'Posted' | 'Private' | 'Draft';
  /** Optional close button in the top-right (for home page map) */
  onClose?: () => void;
};

export default function ReportCard({
  tags = [],
  title,
  location,
  excerpt,
  date,
  timestamp,
  onDetailsPress,
  status,
  onClose,
}: ReportCardProps) {
  return (
    <Pressable style={styles.wrapper} onPress={onDetailsPress}>
      <View style={styles.card}>
        <View style={styles.topBlock}>
          <View style={styles.tagsContainer}>
            <AppText style={styles.tags} numberOfLines={1} ellipsizeMode="tail">
              {tags.join(', ')}
            </AppText>
          </View>

          {onClose ? (
            <Pressable
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering onDetailsPress
                onClose();
              }}
              style={styles.closeButton}>
              <Icon as={X} color="#5E349E" size={20} strokeWidth={2.5} />
            </Pressable>
          ) : status ? (
            <View style={styles.topRight}>
              <AppText style={styles.topRightText} numberOfLines={1} ellipsizeMode="tail">
                {status}
              </AppText>
              <Icon
                as={status === 'Posted' ? Globe : status === 'Private' ? EyeOff : PenLine}
                color="#5E349E"
                size={14}
                strokeWidth={2.2}
                style={{ marginLeft: 6 }}
              />
            </View>
          ) : null}
        </View>

        <AppText numberOfLines={1} style={styles.title} weight="medium">
          {title}
        </AppText>
        {location ? <AppText style={styles.location}>{location}</AppText> : null}

        {excerpt ? (
          <AppText numberOfLines={4} ellipsizeMode="tail" style={styles.excerpt}>
            {excerpt}
          </AppText>
        ) : null}
        <View style={styles.bottomRow}>
          {date ? <AppText style={styles.date}>{date}</AppText> : null}
          {timestamp ? <AppText style={styles.timestamp}>{timestamp}</AppText> : null}
        </View>
      </View>
    </Pressable>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  topBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 10,
  },
  excerpt: {
    color: '#000000',
    fontSize: 16,
    lineHeight: 20,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 0, // Prevent status from shrinking
    marginLeft: 8,
  },
  topRightText: {
    color: '#5E349E',
    fontSize: 14,
  },
  closeButton: {
    flexShrink: 0,
    marginLeft: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    marginTop: 10,
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
