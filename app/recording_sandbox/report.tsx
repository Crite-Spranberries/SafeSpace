import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DescriptionCard } from '@/components/ui/DescriptionCard';
import { CommentCard } from '@/components/ui/CommentCard';

export default function Report() {
  return (
    <>
      <View style={styles.container}>
        <Text>Title generated based on summary</Text>
        <Text>Location</Text>
        <Text>Tags</Text>
        <Badge>
          <Text>Put title here.</Text>
        </Badge>
        <Badge>
          <Text>Put location here.</Text>
        </Badge>

        <Text>Comments</Text>
        <CommentCard description="Commenty input comment saying commenty things about something. In the land of comments, the comments run dry in the absence of authentic comments. There are more comments to be found, but many fail to have appeared in terms of comments." />
      </View>
    </>
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
