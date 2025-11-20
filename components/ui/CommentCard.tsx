import { Text, TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
import { Heart } from 'lucide-react-native';
import { MessageCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type CardProps = ViewProps & {
  description: string;
  onDetailsPress?: () => void;
};

function CommentCard({ className, description, onDetailsPress, ...props }: CardProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'flex flex-col gap-6 rounded-xl border border-border bg-card py-6 shadow-sm shadow-black/5',
          className
        )}
        {...props}>
        <View style={{ paddingHorizontal: 24 }}>
          <Text className={cn('text-sm text-muted-foreground')}>{description}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', width: 80, gap: 25 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Heart />
              <Text>0</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <MessageCircle />
              <Text>0</Text>
            </View>
          </View>
          <Button onPress={onDetailsPress}>
            <Text>Reply</Text>
          </Button>
        </View>
      </View>
    </TextClassContext.Provider>
  );
}

export { CommentCard };
