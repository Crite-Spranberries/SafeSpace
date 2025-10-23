import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link, useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
// import fs from "fs";
// import OpenAI from "openai";
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { ScrollView } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// const defaultAudioSource = require('@/assets/audio/test_audio.mp3');

// const defaultAudioSource = await Asset.fromModule(require('@/assets/audio/default.m4a')).uri;

export default function Details() {
  // Get audioUri passed as URL param
  const { audioUri } = useLocalSearchParams();
  const [defAud, setDefAud] = useState<any>(null);

  useEffect(() => {
    const init = async () => {

      const [{ localUri }] = await Asset.loadAsync(require('@/assets/audio/default.m4a'));
      setDefAud(localUri)
    }
    init();
  }, [])

  // Fallback audio source if param missing

  // Use the recorded audio URI if provided, else fallback
  const player = useAudioPlayer({ uri: defAud ? defAud : "" });
  const [status, setStatus] = useState('Stopped');
  const [audTranscribed, setAudTranscribed] = useState<string>("Parsed data from the audio would ideally go here.");

  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (statusUpdate) => {
      setStatus(
        statusUpdate.playing
          ? 'Playing'
          : statusUpdate.currentTime && statusUpdate.currentTime > 0
            ? 'Paused'
            : 'Stopped'
      );
    });

    return () => subscription?.remove();
  }, [player]);

  const Transcribe = async (def: boolean = false) => {
    // const filePath = defaultAudioSource; // path to your local audio file
    // const fileData = fs.readFileSync(filePath);
    console.log("what is defaut sr", audioUri);
    // return;
    // return;
    // const _sound = await fetch(audioUri);
    // const _buff = await _sound.arrayBuffer();

    // const transcription = await openai.audio.transcriptions.create({
    //   file: audioUri,
    //   model: "gpt-4o-transcribe",
    //   response_format: "text",
    // });
    // console.log("what is buff", _buff)
    // const _resp = await fetch("https://m3rcwp4vofeta3kqelrykbgosi0rswzn.lambda-url.ca-central-1.on.aws/", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "audio/*",
    //   },
    //   body: _buff,
    // });

    // const _json = await _resp.json();
    // console.log("wht is response", _json);
    let _auduri: string | string[] | null = audioUri;
    if (def) {
      _auduri = typeof defAud === "string" ? defAud : null;
      // _auduri = await FileSystem.getContentUriAsync(_auduri);
      console.log("what is aud", _auduri);
    }
    if (typeof _auduri === "string") {
      console.log('start transcribe');
      const _resp = await FileSystem.uploadAsync(
        "https://api.openai.com/v1/audio/transcriptions",
        _auduri,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },

          // Options specifying how to upload the file.
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          mimeType: 'audio/m4a',
          parameters: {
            model: 'gpt-4o-mini-transcribe',
          },
        }
      );

      const _json = JSON.parse(_resp.body)
      console.log("what is resp", _json);
      if (_json.text) {
        setAudTranscribed(_json.text);

        try {
          const jsonValue = JSON.stringify(_json.text);
          await AsyncStorage.setItem('transcribe', jsonValue);
        } catch (e) {
          // saving error
        }
      }
    }
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={{ flexDirection: "row", gap: 2 }}>
          <Button disabled={!audioUri} onPress={() => Transcribe(false)}><Text>Transcribe Recording</Text></Button>
          <Button onPress={() => Transcribe(true)}><Text>Transcribe Default</Text></Button>
        </View>
        <Text variant="h4">"Voice Recording": {status}</Text>
        <View style={styles.container}>
          <Button onPress={() => player.play()}>
            <Text>Play Sound</Text>
          </Button>
          <Button
            onPress={() => {
              player.seekTo(0);
              player.play();
            }}>
            <Text>Replay Sound</Text>
          </Button>
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

        <Text>AI Transcript</Text>
        <DescriptionCard description={audTranscribed} />

        <View style={styles.bottomButtonAlign}>
          <Button>
            <Text>Edit</Text>
          </Button>
          <Link href="./report" asChild>
            <Button>
              <Text>Generate Report</Text>
            </Button>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 10,
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
});
function async(arg0: boolean) {
  throw new Error('Function not implemented.');
}

