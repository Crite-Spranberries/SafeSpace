import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { StyleSheet, View } from 'react-native';

export default function Profile() {
  return (
    <>
      <View style={styles.columnOrientation}>
        <Text>Put top navigation notifs & help here</Text>
        <Text>Put location here</Text>
        <Link href="../create_report" asChild>
          <Button>
            <Text>Create Report</Text>
          </Button>
        </Link>
        <Text>Reports Near You</Text>
        <Text>Put report cards here</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  columnOrientation: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
});
