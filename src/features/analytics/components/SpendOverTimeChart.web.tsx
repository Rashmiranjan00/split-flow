import React from 'react';
import { View, Text } from 'react-native';
import type { TimeBucket } from '@/features/analytics/utils/groupExpensesByDate';

export interface SpendOverTimeChartProps {
  data: TimeBucket[];
  height?: number;
}

export const SpendOverTimeChart: React.FC<SpendOverTimeChartProps> = () => (
  <View style={{ padding: 16, alignItems: 'center' }}>
    <Text style={{ color: '#888' }}>Chart not available on web</Text>
  </View>
);
