import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View, type ViewProps } from 'react-native';
import { Heart } from 'lucide-react-native';
import { MessageCircle } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type CardProps = ViewProps & {
  title: string;
  location: string;
  description: string;
  tags?: string[];
  onDetailsPress?: () => void;
};

function Card({
  className,
  title,
  location,
  description,
  tags = [],
  onDetailsPress,
  ...props
}: CardProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'flex flex-col gap-6 rounded-xl border border-border bg-card py-6 shadow-sm shadow-black/5',
          className
        )}
        {...props}>
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 8 }}>
            {tags.map((tag, i) => (
              <Badge key={i}>
                <Text>{tag}</Text>
              </Badge>
            ))}
          </View>
          <Text className={cn('font-semibold leading-none', 'text-card-title')}>{title}</Text>
          <Text className={cn('text-sm text-muted-foreground')}>{location}</Text>
          <Text className={cn('text-sm text-muted-foreground')}>{description}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
          }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 80 }}>
            <Heart />
            <MessageCircle />
          </View>
          <Button onPress={onDetailsPress}>
            <Text>Details</Text>
          </Button>
        </View>
      </View>
    </TextClassContext.Provider>
  );
}

export { Card };
