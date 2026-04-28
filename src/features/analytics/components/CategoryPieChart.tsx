import React, { useMemo } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { PolarChart, Pie } from 'victory-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import type { CategoryBreakdownSlice } from '@/features/analytics/hooks/useGroupAnalytics';

export interface CategoryPieChartProps {
  data: CategoryBreakdownSlice[];
  size?: number;
}

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ChartWrap = styled.View<{ size: number }>`
  width: ${({ size }: { size: number }) => size}px;
  height: ${({ size }: { size: number }) => size}px;
  margin-right: ${Spacing.md}px;
`;

const LegendColumn = styled.View`
  flex: 1;
`;

const LegendRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.xs}px;
`;

const LegendDot = styled.View<{ bgColor: string }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props: { bgColor: string }) => props.bgColor};
  margin-right: ${Spacing.sm}px;
`;

const LegendLabel = styled.Text`
  flex: 1;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const LegendAmount = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-left: ${Spacing.sm}px;
`;

const LegendPct = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-left: ${Spacing.xs}px;
  min-width: 36px;
  text-align: right;
`;

/**
 * Donut-style category breakdown. Slices are rendered by victory-native's
 * `PolarChart` + `Pie.Chart`; the legend on the right is plain RN text so
 * the component doesn't need a Skia font asset.
 */
export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, size = 140 }) => {
  const { formatCurrency } = useCurrencyFormatter();

  const total = useMemo(
    () => data.reduce((sum, slice) => sum + slice.amount, 0),
    [data]
  );

  const chartData = useMemo(
    () =>
      data.map((slice) => ({
        category: slice.category,
        amount: slice.amount,
        color: slice.color,
      })),
    [data]
  );

  return (
    <Row>
      <ChartWrap size={size}>
        <PolarChart
          data={chartData}
          valueKey="amount"
          colorKey="color"
          labelKey="category"
        >
          <Pie.Chart innerRadius="55%" />
        </PolarChart>
      </ChartWrap>
      <LegendColumn>
        {data.map((slice) => {
          const pct = total > 0 ? (slice.amount / total) * 100 : 0;
          return (
            <LegendRow key={slice.category}>
              <LegendDot bgColor={slice.color} />
              <LegendLabel numberOfLines={1}>{slice.category}</LegendLabel>
              <LegendAmount>
                {formatCurrency(slice.amount, { decimals: 0 })}
              </LegendAmount>
              <LegendPct>{`${pct.toFixed(0)}%`}</LegendPct>
            </LegendRow>
          );
        })}
        {data.length === 0 ? (
          <View>
            <LegendLabel>—</LegendLabel>
          </View>
        ) : null}
      </LegendColumn>
    </Row>
  );
};
