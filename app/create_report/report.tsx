import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/Button';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import { useNavigation } from 'expo-router';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { Badge } from '@/components/ui/Badge';
import { ScrollView } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import Recommendation from '@/components/ui/Recommendation';
import { addReport, reportDataToStoredReport } from '@/lib/reports';
import { ReportData } from '@/lib/reportData';
import { useConfirmation } from '@/components/ui/ConfirmationDialogContext';

const SCREEN_OPTIONS = {
  title: '',
  headerBackTitle: 'Back',
  headerTransparent: true,
  headerLeft: () => (
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Icon as={ArrowLeft} size={24} />
    </TouchableOpacity>
  ),
};

export default function Report() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { showConfirmation } = useConfirmation();

  const date = (params.date as string) || 'No date provided';
  const time = (params.time as string) || 'No time provided';
  const location = (params.location as string) || 'No location provided';
  const reportType = params.reportType ? JSON.parse(params.reportType as string) : [];
  const tradesField = params.tradesField ? JSON.parse(params.tradesField as string) : [];
  const report_desc = (params.description as string) || 'No description provided.';
  const witnesses = params.witnesses ? JSON.parse(params.witnesses as string) : [];
  const individualsInvolved = params.individualsInvolved
    ? JSON.parse(params.individualsInvolved as string)
    : [];
  const actionsTaken = params.actionsTaken ? JSON.parse(params.actionsTaken as string) : [];
  const reportTitle = (params.reportTitle as string) || 'Onsite Harassment Concern Near Coffee Bar';

  function onEdit() {
    const cleanDesc = report_desc === 'No description provided.' ? '' : report_desc;

    router.push({
      pathname: '/my_logs/myPostEdit',
      params: {
        date,
        timestamp: time,
        location,
        report_type: JSON.stringify(reportType),
        trades_field: JSON.stringify(tradesField),
        description: cleanDesc,
        witnesses: JSON.stringify(witnesses),
        primaries_involved: JSON.stringify(individualsInvolved),
        actions_taken: JSON.stringify(actionsTaken),
        reportTitle,
      },
    });
  }

  async function onSave() {
    try {
      const createdAt = new Date();
      const content = report_desc || '';

      // Parse date and time
      const dateObj = new Date(date);
      const month = dateObj.toLocaleString('default', { month: 'long' });
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();
      const hour = dateObj.getHours();
      const minute = dateObj.getMinutes();
      const time = hour * 100 + minute; // Convert to HHMM format

      const reportId = `${createdAt.getTime()}_report`;
      const title = reportTitle || 'Incident Report';

      // Build complete ReportData object
      const reportData: ReportData = {
        isPublic: false,
        report_method: 'manual_form',
        report_id: reportId,
        report_title: title,
        month,
        day,
        year,
        time,
        audio_URI: '',
        audio_duration: 0,
        location_name: location && location !== 'No location provided' ? location : '',
        location_coords: [0, 0],
        report_type: Array.isArray(reportType) ? reportType : [],
        trades_field: Array.isArray(tradesField) ? tradesField : [],
        report_desc: content,
        report_transcript: '',
        primaries_involved: Array.isArray(individualsInvolved) ? individualsInvolved : [],
        witnesses: Array.isArray(witnesses) ? witnesses : [],
        actions_taken: Array.isArray(actionsTaken) ? actionsTaken : [],
        recommended_actions: [],
      };

      // Convert to StoredReport and save
      const payload = reportDataToStoredReport(reportData, reportId);
      await addReport(payload);
    } catch (e) {
      console.warn('Failed to save report', e);
    }
    const confirmed = await showConfirmation({
      title: 'Report Saved',
      description: (
        <AppText style={styles.confirmationDescription}>
          Your report has been saved.{'\n'}
          Go to My Logs to post it publicly.
        </AppText>
      ),
      cancelText: 'Back to Home',
      confirmText: 'My Logs',
      confirmVariant: 'purple',
    });

    if (confirmed) {
      router.push('/(tabs)/myLogs');
    } else {
      router.push('/(tabs)');
    }
  }

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <AppText weight="medium" style={styles.title}>
              {reportTitle}
            </AppText>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}>
              <AppText style={styles.descriptionWhite}>{date}</AppText>
              <AppText style={styles.descriptionWhite}>{time}</AppText>
            </View>
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Report Type
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {reportType.length > 0 ? (
                  reportType.map((tag: string, index: number) => (
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
            <View>
              <AppText weight="medium" style={styles.subHeader}>
                Trades Field
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tradesField.length > 0 ? (
                  tradesField.map((tag: string, index: number) => (
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
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText weight="medium" style={styles.subHeader}>
                  AI Summary
                </AppText>
                <AppText style={{ color: '#B0B0B0' }}>GPT-4o</AppText>
              </View>

              <AppText style={styles.descriptionWhite}>
                {report_desc ?? 'No description provided.'}
              </AppText>
            </View>

            <View style={styles.recommendationsSection}>
              <AppText weight="medium" style={styles.subHeader}>
                Recommended Actions
              </AppText>
              <Recommendation text="Provide Bystander Intervention and Respect Training" />
              <Recommendation text="Require Pre-Task Safety and Inclusion Briefings" />
              <Recommendation text="Implement a Zero-Tolerance Harassment Policy" />
              <Recommendation text="Enforce Proper PPE Usage at All Times" />
            </View>
          </View>
        </ScrollView>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 24, gap: 24 }}>
          <Button
            variant="reallyLightGrey"
            size="lg"
            radius="full"
            style={{ flex: 1 }}
            onPress={onEdit}>
            <AppText weight="medium" style={{ color: '#5E349E', fontSize: 16 }}>
              Edit
            </AppText>
          </Button>
          <Button variant="purple" size="lg" radius="full" style={{ flex: 1 }} onPress={onSave}>
            <AppText weight="medium" style={{ color: '#FFFFFF', fontSize: 16 }}>
              Save Report
            </AppText>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
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
    // marginLeft: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 10,
  },
  subHeader: {
    fontSize: 20,
    marginBottom: 8,
    color: '#FFF',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 30,
    color: '#FFF',
  },
  descriptionBlack: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  descriptionWhite: {
    fontSize: 16,
    color: '#fff',
  },
  recommendationsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24,
  },
  badgeText: {
    color: '#FFF',
    marginHorizontal: 8,
    fontSize: 16,
  },

  confirmationDescription: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
  },
});
