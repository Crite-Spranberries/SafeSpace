import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';

export default function Details() {
  return (
    <>
      <Text>Details...</Text>
      <Link href="./report" asChild>
        <Button>
          <Text>Create Report</Text>
        </Button>
      </Link>
    </>
  );
}
