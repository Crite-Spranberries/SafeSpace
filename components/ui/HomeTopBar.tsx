import { cn } from '@/lib/utils';
import * as React from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Bell, CircleHelp } from 'lucide-react-native';

type HomeTopBarProps = ViewProps & {
	onPressNotifications?: () => void;
	onPressHelp?: () => void;
	showUnreadDot?: boolean;
	className?: string;
};

export function HomeTopBar({
	onPressNotifications,
	onPressHelp,
	showUnreadDot = true,
	className,
	style,
	...rest
}: HomeTopBarProps) {
	return (
		<View
			{...rest}
			className={cn(
				'w-full flex-row items-center justify-between rounded-[24px] border border-white bg-white/70 px-4 py-3',
				className
			)}
			style={[style, { backgroundColor: 'rgba(255,255,255,0.7)' }]}
		>
			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Notifications"
				onPress={onPressNotifications}
				hitSlop={8}
				className="relative h-10 w-10 items-center justify-center rounded-full p-2"
			>
				<Icon as={Bell} className="text-black" size={24} />
        				{/* Notification dot */}
				{showUnreadDot ? (
					<View className="absolute h-2 w-2 rounded-full" style={{ backgroundColor: '#E06A36', left: 22, top: 12 }} />
				) : null}
			</Pressable>

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Help"
				onPress={onPressHelp}
				hitSlop={8}
				className="h-10 w-10 items-center justify-center rounded-full p-2"
			>
				<Icon as={CircleHelp} className="text-black" size={24} />
			</Pressable>
		</View>
	);
}

export default HomeTopBar;

