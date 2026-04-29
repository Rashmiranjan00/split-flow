import React from 'react';
import { View, Text } from 'react-native';

export interface ContributionBar {
  id: string;
  label: string;
  amount: number;
}

export interface ContributionBarChartProps {
  data: ContributionBar[];
  height?: number;
}

export const ContributionBarChart: React.FC<ContributionBarChartProps> = () => (
  <View style={{ padding: 16, alignItems: 'center' }}>
    <Text style={{ color: '#888' }}>Chart not available on web</Text>
  </View>
);
