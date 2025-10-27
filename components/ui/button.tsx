import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';
import { useState } from 'react';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-md shadow-none',
    Platform.select({
      web: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary shadow-sm shadow-black/5 active:bg-primary/90',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive shadow-sm shadow-black/5 active:bg-destructive/90 dark:bg-destructive/60',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border border-white-500 bg-transparent active:bg-accent dark:active:bg-input/50',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        lightGrey: cn(
          'bg-white-500/50 shadow-sm shadow-black/5 active:bg-white-500/30',
          Platform.select({ web: 'hover:bg-white-5000/30' })
        ),
        darkGrey: cn(
          'bg-white-500/30 shadow-sm shadow-black/5 active:bg-white-500/10',
          Platform.select({ web: 'hover:bg-white-500/10' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        success: cn(
          'bg-green-500 shadow-sm shadow-black/5 active:bg-green-600',
          Platform.select({ web: 'hover:bg-green-600 focus-visible:ring-green-500/30' })
        ),
        // Custom button variants for recording page
        cancelRecording: cn(
          'size:customRecordingSmall bg-white-700 shadow-sm shadow-black/5 active:bg-sky-600',
          Platform.select({
            web: 'hover:bg-sky-600 focus-visible:ring-sky-500/30 dark:hover:bg-accent/50',
          })
        ),
        pauseRecording: cn(
          'bg-violet-500 shadow-sm shadow-black/5 active:bg-sky-600',
          Platform.select({
            web: 'hover:bg-sky-600 focus-visible:ring-sky-500/30 dark:hover:bg-accent/50',
          })
        ),
        startRecording: cn(
          'bg-violet-300 shadow-sm shadow-black/5 active:bg-sky-600',
          Platform.select({
            web: 'hover:bg-sky-600 focus-visible:ring-sky-500/30 dark:hover:bg-accent/50',
          })
        ),
        saveRecording: cn(
          'size:customRecordingSmall bg-white-500 shadow-sm shadow-black/5 active:bg-sky-600',
          Platform.select({
            web: 'hover:bg-sky-600 focus-visible:ring-sky-500/30 dark:hover:bg-accent/50',
          })
        ),
        purple: cn(
          'bg-violet-500 shadow-sm shadow-black/5 active:bg-violet-500/80',
          Platform.select({
            web: 'hover:bg-violet-500/80 focus-visible:ring-violet-500/30 dark:hover:bg-accent/50',
          })
        ),
      },
      size: {
        default: cn('h-10 px-4 py-2 sm:h-9', Platform.select({ web: 'has-[>svg]:px-3' })),
        sm: cn('h-9 gap-1.5 rounded-md px-3 sm:h-8', Platform.select({ web: 'has-[>svg]:px-2.5' })),
        lg: cn('h-11 rounded-md px-6 sm:h-10', Platform.select({ web: 'has-[>svg]:px-4' })),
        icon: 'h-10 w-10 px-6 py-6 sm:h-9 sm:w-9',
        // Custom button variant sizes
        customRecordingSmall: 'h-[96px] w-[78px] px-2 py-2',
        customRecordingLarge: 'h-[96px] w-[173px] px-2 py-2',
        multiLine: 'h-auto px-6 py-6',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'md',
    },
  }
);

const buttonTextVariants = cva(
  cn('text-sm font-medium', Platform.select({ web: 'pointer-events-none transition-colors' })),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
        cancelRecording: 'text-white',
        pauseRecording: 'text-white',
        startRecording: 'text-white',
        saveRecording: 'text-white',
        success: 'text-white',
        purple: '!text-white',
        lightGrey: '!text-white',
        darkGrey: '!text-white',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
        customRecordingSmall: '',
        customRecordingLarge: '',
        multiLine: '',
      },
      radius: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      radius: 'md',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, radius, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size, radius })}>
      <Pressable
        className={cn(
          props.disabled && 'opacity-50',
          buttonVariants({ variant, size, radius }),
          className
        )}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
