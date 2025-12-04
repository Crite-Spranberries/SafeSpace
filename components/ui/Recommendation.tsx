import { AppText } from './AppText';
import { View, TouchableOpacity, Linking } from 'react-native';
import { StyleSheet } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { Icon } from './Icon';

type RecommendationProps = {
  text: string;
  resourceLink?: string | null;
};

export default function Recommendation({ text, resourceLink }: RecommendationProps) {
  const handleLinkPress = async () => {
    if (resourceLink) {
      try {
        const canOpen = await Linking.canOpenURL(resourceLink);
        if (canOpen) {
          await Linking.openURL(resourceLink);
        } else {
          console.warn('Cannot open URL:', resourceLink);
        }
      } catch (err) {
        console.error('Failed to open resource link', err);
      }
    }
  };

  // Debug logging
  console.log('Recommendation component:', { text, resourceLink });

  // Debug logging
  if (!resourceLink) {
    console.log(`No link for action: "${text}"`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppText style={styles.text}>{text}</AppText>
        {resourceLink && (
          <TouchableOpacity style={styles.linkButton} onPress={handleLinkPress} activeOpacity={0.7}>
            <Icon as={ExternalLink} size={16} color="#8449DF" />
            <AppText style={styles.linkText}>WorksafeBC Resource</AppText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF4D',
    borderRadius: 12,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'column',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  linkText: {
    color: '#8449DF',
    fontSize: 14,
    fontWeight: '500',
  },
});
