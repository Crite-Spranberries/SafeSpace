import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, router, usePathname } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import { CommentCard } from '@/components/ui/CommentCard';
import MapOnDetail from '@/components/ui/MapOnDetail';
import { RetrieveResponse } from 'roughlyai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
          // value previously stored
          // this.window = null

          // const _url = await PromptModel({
          //   prompt: `Using "report_template.txt" as a template, create a report for the following transcript:
          //   ${value}`,
          //   api_key: process.env.EXPO_PUBLIC_ROUGHLYAI_API_KEY,
          //   dir: "2025Projects/safespace",
          //   model: "gpt-4.1-mini"
          // });
          const _resp = await fetch(
            'https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/',
            {
              method: 'POST',
              body: JSON.stringify({
                prompt: `Using "report_template.txt" as a template, create a report for the following transcript:
              ${value}
              
              For information missing, respond with "Not Provided". Make an educated guess for "Trades field", "Type of Report", "Type of Discrimination", and "Incident Details" based on the transcript.`,
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
  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text>Title generated based on summary</Text>
          <Text>Location</Text>
          <View className="w-full max-w-md">
            <MapOnDetail />
          </View>
          <Text>Tags</Text>

          <View style={styles.tagAlign}>
            <Badge>
              <Text>Longshore</Text>
            </Badge>
            <Badge>
              <Text>Harassment</Text>
            </Badge>
            <Badge>
              <Text>Warning</Text>
            </Badge>
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
});
