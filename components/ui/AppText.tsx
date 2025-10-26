import React from 'react';
import { Text, TextProps } from 'react-native';

type FontWeight = 'regular' | 'medium' | 'bold' | 'light' | 'black';

interface AppTextProps extends TextProps {
  weight?: FontWeight;
}

const fontMap = {
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
  bold: 'Satoshi-Bold',
  light: 'Satoshi-Light',
  black: 'Satoshi-Black',
};

export function AppText({ weight = 'regular', style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[{ fontFamily: fontMap[weight] }, style]}
    >
      {props.children}
    </Text>
  );
}
