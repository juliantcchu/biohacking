import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  percentage: number;
  radius: number;
  strokeWidth: number;
  color: string;
}

export function CircularProgress({ percentage, radius, strokeWidth, color }: CircularProgressProps) {
  const circumference = 2 * Math.PI * radius;
  const progressStroke = ((100 - percentage) * circumference) / 100;

  return (
    <View>
      <Svg width={radius * 2} height={radius * 2}>
        <Circle
          stroke="#E6E6E6"
          fill="none"
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressStroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
    </View>
  );
} 