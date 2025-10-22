import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';

export default function Recording() {
  return (
    <>
      <Text>Recording...</Text>
      <Link href="../recording_testing/details" asChild>
        <Button>
          <Text>Save Recording</Text>
        </Button>
      </Link>
    </>
  );
}
