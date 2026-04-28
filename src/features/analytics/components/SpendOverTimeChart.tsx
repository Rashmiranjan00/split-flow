import React, { useMemo } from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { CartesianChart, Line } from 'victory-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import type { TimeBucket } from '@/features/analytics/utils/groupExpensesByDate';

export interface SpendOverTimeChartProps {
  data: TimeBucket[];
  height?: number;
}

const ChartWrap = styled.View<{ h: number }>`
  height: ${({ h }: { h: number }) => h}px;
`;

const TickRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${Spacing.sm}px;
  padding: 0 ${Spacing.sm}px;
`;

const TickLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 10px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const SummaryRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${Spacing.xs}px;
`;

const SummaryLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const SummaryValue = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

/**
 * Natural-curve line chart showing spend per time bucket. We render up to
 * three axis labels manually (start, middle, end) instead of a Skia font.
 */
export const SpendOverTimeChart: React.FC<SpendOverTimeChartProps> = ({
  data,
  height = 200,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();

  const chartData = useMemo(
    () =>
      data.map((bucket) => ({
        ts: bucket.timestamp,
        total: bucket.total,
      })),
    [data]
  );

  const totalValue = useMemo(
    () => data.reduce((sum, b) => sum + b.total, 0),
    [data]
  );

  const peakBucket = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((max, b) => (b.total > max.total ? b : max), data[0]);
  }, [data]);

  const ticks = useMemo(() => {
    if (data.length === 0) return [] as string[];
    if (data.length === 1) return [data[0].label];
    if (data.length === 2) return [data[0].label, data[1].label];
    const mid = data[Math.floor(data.length / 2)];
    return [data[0].label, mid.label, data[data.length - 1].label];
  }, [data]);

  return (
    <View>
      <SummaryRow>
        <SummaryLabel>Total</SummaryLabel>
        <SummaryValue>{formatCurrency(totalValue, { decimals: 0 })}</SummaryValue>
      </SummaryRow>
      {peakBucket ? (
        <SummaryRow>
          <SummaryLabel>Peak</SummaryLabel>
          <SummaryValue>
            {`${formatCurrency(peakBucket.total, { decimals: 0 })} · ${peakBucket.label}`}
          </SummaryValue>
        </SummaryRow>
      ) : null}

      <ChartWrap h={height}>
        <CartesianChart
          data={chartData}
          xKey="ts"
          yKeys={['total']}
          domainPadding={{ left: 10, right: 10, top: 24, bottom: 10 }}
        >
          {({ points }: any) => (
            <Line
              points={points.total}
              color={theme.colors.primary}
              strokeWidth={2}
              curveType="natural"
              animate={{ type: 'spring' }}
            />
          )}
        </CartesianChart>
      </ChartWrap>

      <TickRow>
        {ticks.map((tick, idx) => (
          <TickLabel key={`${tick}-${idx}`}>{tick}</TickLabel>
        ))}
      </TickRow>
    </View>
  );
};
