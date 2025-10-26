import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform } from 'react-native';

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & React.RefAttributes<SwitchPrimitives.RootRef>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'flex h-[3rem] w-20 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5', // 3x height and width
        Platform.select({
          web: 'peer inline-flex outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed',
        }),
        props.checked ? 'bg-primary' : 'bg-input dark:bg-input/80',
        props.disabled && 'opacity-50',
        className
      )}
      {...props}>
      <SwitchPrimitives.Thumb
        className={cn(
          'h-10 w-10 rounded-full bg-background transition-transform', // 3x thumb size (48px)
          Platform.select({
            web: 'pointer-events-none block ring-0',
          }),
          props.checked
            ? 'translate-x-10 dark:bg-primary-foreground' // 3x translate (14px * 4 = 56px approx)
            : 'translate-x-0 dark:bg-foreground'
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
