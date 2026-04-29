import React from 'react';
import { View, Text } from 'react-native';
import type { CategoryBreakdownSlice } from '@/features/analytics/hooks/useGroupAnalytics';

export interface CategoryPieChartProps {
  data: CategoryBreakdownSlice[];
  size?: number;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => (
  <View style={{ padding: 16, alignItems: 'center' }}>
    <Text style={{ color: '#888' }}>Chart not available on web</Text>
  </View>
);
