import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Link, router, usePathname } from 'expo-router';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { RetrieveResponse } from 'roughlyai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Icon } from '@/components/ui/Icon';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

/**
 * Reads the report format template from assets
 * Tries multiple methods to load the template file
 */
const loadReportTemplate = async (): Promise<string> => {
  try {
    // Method 1: Try using Asset.fromModule (works if Metro is configured for .txt files)
    try {
      const asset = Asset.fromModule(require('@/assets/data/report_format.txt'));
      await asset.downloadAsync();

      if (asset.localUri) {
        const templateContent = await FileSystem.readAsStringAsync(asset.localUri);
        if (templateContent.trim()) {
          return templateContent.trim();
        }
      }
    } catch (assetErr) {
      // Method 2: Try direct require (if Metro handles .txt files)
      try {
        const templateModule = require('@/assets/data/report_format.txt');
        if (typeof templateModule === 'string') {
          return templateModule.trim();
        }
        if (templateModule?.default && typeof templateModule.default === 'string') {
          return templateModule.default.trim();
        }
      } catch (requireErr) {
        console.warn('Could not load template via require:', requireErr);
      }
    }

    console.warn('Report template could not be loaded, using empty template');
    return '';
  } catch (err) {
    console.warn('Failed to load report template:', err);
    return '';
  }
};

export default function Report() {
  const path = usePathname();
  const [report, setReport] = useState<string>('');
  useEffect(() => {
    console.log('effect', path);
    const init = async () => {
      console.log('init');
      try {
        const value = await AsyncStorage.getItem('transcribe');
        console.log('value', typeof window);
        if (value !== null) {
          // Load the local report template
          const templateContent = await loadReportTemplate();

          // Build the prompt with the template content
          const templateSection = templateContent
            ? `Use the following template format:\n\n${templateContent}\n\n`
            : 'Using the standard report format, ';

          const prompt = `${templateSection}create a report for the following transcript:
              ${value}
              
              For information missing, respond with "Not Provided". Make an educated guess for "Trades field", "Type of Report", "Type of Discrimination", and "Incident Details" based on the transcript.`;

          const _resp = await fetch(
            'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
            {
              method: 'POST',
              body: JSON.stringify({
                prompt,
                project_name: 'safespace',
              }),
            }
          );

          const _json_string = await _resp.json();
          const _json: { url: string } = JSON.parse(_json_string);

          console.log('what is _json', _json.url);
          // console.log("url", _url)
          const _report: any = await RetrieveResponse(_json.url);
          setReport(_report.answer);
        }
      } catch (e: any) {
        // error reading value
        console.log('what is error', e.message);
      }
    };
    init();
  }, [path]);

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

  return (
    <>
      <LinearGradient colors={['#371F5E', '#000']} locations={[0, 0.3]} style={styles.background} />
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ScrollView>
          <View style={styles.container}>
            <Text variant="h2" style={styles.title}>
              Report Summary
            </Text>
            <View className="w-full max-w-md">
              <MapOnDetail />
            </View>
            <View>
              <View style={{ flexDirection: 'column', gap: 5 }}>
                {(() => {
                  const lines = report.split('\n');
                  let output = lines.map((line, index) => {
                    return <Text key={`line_${index}`}>{line || <>&nbsp;</>}</Text>;
                  });
                  return <>{output}</>;
                })()}
              </View>
            </View>
            {/* <View>
            <Text>Summary</Text>
            <DescriptionCard description="Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in." />
          </View> */}
            {/* <View>
            <Text>Comments</Text>
            <CommentCard description="Commenty input comment saying commenty things about something. In the land of comments, the comments run dry in the absence of authentic comments. There are more comments to be found, but many fail to have appeared in terms of comments." />
          </View> */}
          </View>
          <Button onPress={() => router.push('/(tabs)')}>
            <Text>Home</Text>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 10,
    gap: 5,
  },
  bottomButtonAlign: {
    alignContent: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  tagAlign: {
    alignContent: 'center',
    flexDirection: 'row',
    gap: 24,
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
    // marginLeft: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    // marginBottom: 8,
    marginTop: 24,
    borderColor: 'transparent',
  },
});
