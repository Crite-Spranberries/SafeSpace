import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Link } from 'expo-router';

export default function MyLogs() {
  return (
    <>
      <Text>My Logs</Text>
      <Link href="../create_report" asChild>
        <Button>
          <Text>Create Report</Text>
        </Button>
      </Link>
    </>
  );
}
