import React, { useMemo } from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { CartesianChart, Bar } from 'victory-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

export interface ContributionBar {
  id: string;
  label: string;
  amount: number;
}

export interface ContributionBarChartProps {
  data: ContributionBar[];
  height?: number;
}

const ChartWrap = styled.View<{ h: number }>`
  height: ${({ h }: { h: number }) => h}px;
`;

const LabelsRow = styled.View`
  flex-direction: row;
  margin-top: ${Spacing.sm}px;
`;

const LabelColumn = styled.View`
  flex: 1;
  align-items: center;
`;

const LabelName = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const LabelAmount = styled.Text`
  margin-top: 2px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

/**
 * Horizontal-axis category-less bar chart used for member/friend contribution
 * comparisons. Labels are rendered beneath each bar as regular RN text so no
 * Skia font asset is needed.
 */
export const ContributionBarChart: React.FC<ContributionBarChartProps> = ({
  data,
  height = 180,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();

  const chartData = useMemo(
    () => data.map((d) => ({ x: d.id, amount: d.amount })),
    [data]
  );

  const maxAmount = useMemo(
    () => data.reduce((max, d) => Math.max(max, d.amount), 0),
    [data]
  );

  return (
    <View>
      <ChartWrap h={height}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={['amount']}
          domain={{ y: [0, Math.max(maxAmount, 1)] }}
          domainPadding={{ left: 40, right: 40, top: 20 }}
        >
          {({ points, chartBounds }: any) => (
            <Bar
              points={points.amount}
              chartBounds={chartBounds}
              roundedCorners={{ topLeft: 6, topRight: 6 }}
              animate={{ type: 'spring' }}
              color={theme.colors.brandAccent}
              innerPadding={0.35}
            />
          )}
        </CartesianChart>
      </ChartWrap>
      <LabelsRow>
        {data.map((d) => (
          <LabelColumn key={d.id}>
            <LabelName numberOfLines={1}>{d.label}</LabelName>
            <LabelAmount>{formatCurrency(d.amount, { decimals: 0 })}</LabelAmount>
          </LabelColumn>
        ))}
      </LabelsRow>
    </View>
  );
};
