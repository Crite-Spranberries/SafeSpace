import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ArrowLeft, Trash2, PenLine } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import Recommendation from '@/components/ui/Recommendation';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';
import { Link, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { deleteReport } from '@/lib/reports';
import { lockState } from '@/lib/lockState';

export default function MyPostDetails() {
  const params = useLocalSearchParams<{
    report?: string;
    title?: string;
    id?: string;
    date?: string;
    timestamp?: string;
    location?: string;
    tags?: string;
    report_type?: string;
    trades_field?: string;
    status?: string;
  }>();
  const reportParam = typeof params.report === 'string' ? params.report : null;
  const titleParam = typeof params.title === 'string' ? params.title : null;
  const idParam = typeof params.id === 'string' ? params.id : null;
  const dateParam = typeof params.date === 'string' ? params.date : null;
  const timestampParam = typeof params.timestamp === 'string' ? params.timestamp : null;
  const locationParam = typeof params.location === 'string' ? params.location : null;
  const tagsParam = typeof params.tags === 'string' ? JSON.parse(params.tags) : [];
  const reportTypeParam =
    typeof params.report_type === 'string' ? JSON.parse(params.report_type) : [];
  const tradesFieldParam =
    typeof params.trades_field === 'string' ? JSON.parse(params.trades_field) : [];
  const statusParam = typeof params.status === 'string' ? params.status : 'Private';

  const SCREEN_OPTIONS = {
    title: '',
    headerBackTitle: 'Back',
    headerTransparent: true,
    headerLeft: () => (
      <TouchableOpacity style={styles.backButton} onPress={() => {
        lockState.shouldUnlockMyLogs = true;
        router.push('/(tabs)/myLogs')}}>
        <Icon as={ArrowLeft} size={16} />
      </TouchableOpacity>
    ),
  };

  const { showConfirmation } = useConfirmation();
  const [isPublic, setIsPublic] = useState(statusParam === 'Posted');

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <AppText weight="bold" style={styles.title}>
              {idParam === 'default-report-1' || idParam === 'default-report-2'
                ? titleParam || 'Report Details'
                : titleParam
                  ? `${titleParam}`
                  : 'Title generated based on summary'}
            </AppText>
            <View style={styles.subtitleContainer}>
              <AppText style={styles.subtitleText}>{dateParam}</AppText>
              <AppText style={styles.subtitleText}>{timestampParam}</AppText>
            </View>
            <MapOnDetail
              address={locationParam || '3700 Willingdon Avenue, Burnaby'}
              style={styles.mapOnDetail}
            />

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Report Type
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reportTypeParam.length > 0 ? (
                  reportTypeParam.map((tag: string, index: number) => (
                    <Badge key={index} variant="darkGrey" className="mr-2 px-4">
                      <AppText style={styles.badgeText} weight="medium">
                        {tag}
                      </AppText>
                    </Badge>
                  ))
                ) : (
                  <AppText style={{ color: '#B0B0B0', fontSize: 16 }}>None</AppText>
                )}
              </ScrollView>
            </View>

            <View style={styles.badgeSection}>
              <AppText style={styles.badgeTitle} weight="medium">
                Trades Field
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tradesFieldParam.length > 0 ? (
                  tradesFieldParam.map((tag: string, index: number) => (
                    <Badge key={index} variant="darkGrey" className="mr-2 px-4">
                      <AppText style={styles.badgeText} weight="medium">
                        {tag}
                      </AppText>
                    </Badge>
                  ))
                ) : (
                  <AppText style={{ color: '#B0B0B0', fontSize: 16 }}>None</AppText>
                )}
              </ScrollView>
            </View>

            <View style={styles.transcriptSection}>
              <View style={styles.transcriptHeader}>
                <AppText style={styles.transcriptTitle} weight="medium">
                  AI Summary
                </AppText>
                <AppText style={styles.transcriptModel}>GPT-4o</AppText>
              </View>
              <AppText style={styles.transcriptText}>
                {reportParam ?? 'No report available.'}
              </AppText>
            </View>

            <View style={styles.recommendationsSection}>
              <AppText weight="medium" style={styles.recommendTitle}>
                Recommended Actions
              </AppText>
              <Recommendation text="Provide Bystander Intervention and Respect Training" />
              <Recommendation text="Require Pre-Task Safety and Inclusion Briefings" />
              <Recommendation text="Implement a Zero-Tolerance Harassment Policy" />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.reportIcon}
                onPress={async () => {
                  const confirmed = await showConfirmation({
                    title: 'Delete Report?',
                    description:
                      "Are you sure you want to delete this report? You can't undo this.",
                    cancelText: 'Cancel',
                    confirmText: 'Delete',
                    confirmVariant: 'destructive',
                  });

                  if (confirmed) {
                    if (idParam) {
                      await deleteReport(idParam);
                      Alert.alert('Deleted', 'Report has been deleted.', [
                        {
                          text: 'OK',
                          onPress: () => {
                            lockState.shouldUnlockMyLogs = true;
                            router.navigate('/(tabs)/myLogs');
                          },
                        },
                      ]);
                    } else {
                      Alert.alert('Error', 'Could not delete report: ID missing.');
                    } 
                  }
                }}>
                <Icon as={Trash2} color="#FFFFFF" size={24} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editIcon}
                onPress={() => {
                  router.push('/my_logs/myPostEdit');
                }}>
                <Icon as={PenLine} color="#5E349E" size={24} />
              </TouchableOpacity>
              <Button
                variant={isPublic ? 'darkGrey' : 'purple'}
                radius="full"
                style={styles.postButton}
                onPress={async () => {
                  if (!isPublic) {
                    // Going from private -> public
                    const confirmed = await showConfirmation({
                      title: 'Post Report Publicly?',
                      description: (
                        <AppText style={styles.confirmationDescription}>
                          Your report will now be <AppText weight="bold">visible</AppText> to all
                          SafeSpace users. Personal or identifying information will be{' '}
                          <AppText weight="bold">censored</AppText> to protect your privacy.
                        </AppText>
                      ),
                      cancelText: 'Cancel',
                      confirmText: 'Post Publicly',
                      confirmVariant: 'purple',
                    });

                    if (confirmed) {
                      setIsPublic(true);
                      Alert.alert('Posted', 'Report has been made public.');
                    }
                  } else {
                    // Going from public -> private
                    const confirmed = await showConfirmation({
                      title: 'Make Report Private?',
                      description: (
                        <AppText style={styles.confirmationDescription}>
                          Your report will no longer be public. Any comments received on this report
                          will be deleted.
                        </AppText>
                      ),
                      cancelText: 'Cancel',
                      confirmText: 'Make Private',
                      confirmVariant: 'purple',
                    });

                    if (confirmed) {
                      setIsPublic(false);
                      Alert.alert('Updated', 'Report has been made private.');
                    }
                  }
                }}>
                <AppText weight="medium" style={styles.reportPostText}>
                  {isPublic ? 'Make Private' : 'Post Publicly'}
                </AppText>
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 35,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff33',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  title: {
    fontSize: 24,
    marginTop: 24,
    borderColor: 'transparent',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  subtitleText: {
    color: '#FFF',
    fontSize: 16,
  },
  badgeSection: {
    marginBottom: 24,
  },
  badgeTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  transcriptSection: {
    marginBottom: 24,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  transcriptTitle: {
    fontSize: 20,
    color: '#fff',
  },
  transcriptModel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  transcriptText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  mapOnDetail: {
    marginBottom: 24,
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 36,
  },
  recommendTitle: {
    fontSize: 20,
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    height: 52,
  },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#4D4D4D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#B2B2B2',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#efefefff',
    borderWidth: 1,
  },
  reportPostText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 19,
  },
  postButton: {
    height: 52,
    width: 193,
  },
  confirmationDescription: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
  },
});
