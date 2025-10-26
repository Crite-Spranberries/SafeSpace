import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View, ViewProps } from 'react-native';

type DescriptionCardProps = ViewProps & {
  description: string;
};

function DescriptionCard({ className, description, ...props }: DescriptionCardProps) {
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
      </View>
    </TextClassContext.Provider>
  );
}

export { DescriptionCard };
