import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View } from 'react-native';
import { Card } from '@/components/ui/card';

export default function Profile() {
  const tags = ['Tag #1', 'Tag #2'];
  const onDetails = () => {
    // handle details button pressed
  };

  return (
    <View style={styles.pageContainer}>
      <Text>Put top navigation notifs & help here</Text>
      <Text>Put location here</Text>
      <Link href="../create_report" asChild>
        <Button>
          <Text>Create Report</Text>
        </Button>
      </Link>
      <Text>Reports Near You</Text>
      <Card
        tags={tags}
        title="Title goes here"
        location="Location goes here"
        description="AI Description goes here"
        onDetailsPress={onDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    margin: 10,
    flexDirection: 'column',
    gap: 24,
  },
});
