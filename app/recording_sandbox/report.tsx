import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import { CommentCard } from '@/components/ui/CommentCard';

export default function Report() {
  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <Text>Title generated based on summary</Text>
          <Text>Location</Text>
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
            <Text>Summary</Text>
            <DescriptionCard description="Lorem ipsum dolor sit amet consectetur. Neque turpis id vulputate malesuada amet pellentesque leo vel. Sapien eget cras ac neque feugiat porta elementum felis pharetra. Ut consequat dui malesuada odio posuere tristique habitasse gravida in." />
          </View>
          <View>
            <Text>Comments</Text>
            <CommentCard description="Commenty input comment saying commenty things about something. In the land of comments, the comments run dry in the absence of authentic comments. There are more comments to be found, but many fail to have appeared in terms of comments." />
          </View>
        </View>
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
});
