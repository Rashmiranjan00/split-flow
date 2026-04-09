import React from 'react';
import styled from 'styled-components/native';
import { View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { getSpendingByCategory, getTotalBalance, MONTHLY_SPENDING, MOCK_EXPENSES } from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const BAR_CHART_HEIGHT = 140;

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${Spacing.lg}px;
`;

const HeaderTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
  letter-spacing: -1.5px;
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
  margin-bottom: ${Spacing.md}px;
  margin-top: ${Spacing.lg}px;
`;

const StatCard = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.xl}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const StatRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const StatLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${Spacing.xs}px;
`;

const StatValue = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
  letter-spacing: -1px;
`;

const StatValueSmall = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean}) => positive ? Colors.tertiary : Colors.error};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.semibold};
  margin-bottom: 4px;
`;

const TwoColRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
`;

const HalfCard = styled.View`
  flex: 1;
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

// ── Bar Chart ────────────────────────────────────────────────────
const BarChartContainer = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  padding-bottom: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const BarsRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  height: ${BAR_CHART_HEIGHT}px;
  margin-bottom: ${Spacing.sm}px;
`;

const BarWrapper = styled.View`
  align-items: center;
  flex: 1;
`;

const Bar = styled.View<{ height: number; active: boolean }>`
  width: 24px;
  height: ${({ height }: { height: number; active: boolean }) => height}px;
  border-radius: 6px;
  background-color: ${({ active }: { height: number; active: boolean }) => active ? Colors.primary : Colors.surfaceContainerHigh};
  margin-bottom: ${Spacing.xs}px;
`;

const BarLabel = styled.Text<{ active: boolean }>`
  color: ${({ active }: { active: boolean }) => active ? Colors.primary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: 10px;
  font-weight: ${({ active }: { active: boolean }) => active ? '700' : '400'};
`;

// ── Donut Chart (pure RN) ─────────────────────────────────────────
const DonutContainer = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const DonutContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

const DonutVisual = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border-width: 16px;
  border-color: ${Colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.lg}px;
  background-color: ${Colors.surfaceContainerHigh};
`;

const DonutCenter = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.bold};
`;

const LegendList = styled.View`
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
  background-color: ${({ bgColor }: { bgColor: string }) => bgColor};
  margin-right: ${Spacing.sm}px;
`;

const LegendLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  flex: 1;
`;

const LegendAmount = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
`;

export default function AnalyticsScreen() {
  const categoryData = getSpendingByCategory('usr_1');
  const totalBalance = getTotalBalance('usr_1');
  const totalSpent = MOCK_EXPENSES
    .flatMap(e => e.splits)
    .filter(s => s.userId === 'usr_1')
    .reduce((sum, s) => sum + s.value, 0);
  const totalOwed = MOCK_EXPENSES
    .filter(e => e.payerId === 'usr_1')
    .reduce((sum, e) => {
      const myShare = e.splits.find(s => s.userId === 'usr_1')?.value ?? 0;
      return sum + (e.amount - myShare);
    }, 0);
  const totalIOwe = MOCK_EXPENSES
    .filter(e => e.payerId !== 'usr_1')
    .flatMap(e => e.splits)
    .filter(s => s.userId === 'usr_1')
    .reduce((sum, s) => sum + s.value, 0);

  // Bar chart: normalize
  const maxMonthly = Math.max(...MONTHLY_SPENDING.map(m => m.amount));
  const activeIdx = MONTHLY_SPENDING.length - 1;

  return (
    <Container edges={['top']}>
      <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <HeaderTitle>Insights</HeaderTitle>

        {/* Net Balance Card */}
        <StatCard>
          <StatLabel>Net Balance</StatLabel>
          <StatRow>
            <StatValue>${Math.abs(totalBalance).toFixed(2)}</StatValue>
            <StatValueSmall positive={totalBalance >= 0}>
              {totalBalance >= 0 ? '▲ You are owed' : '▼ You owe'}
            </StatValueSmall>
          </StatRow>
        </StatCard>

        {/* Two small stat cards */}
        <TwoColRow>
          <HalfCard>
            <StatLabel>They owe you</StatLabel>
            <StatValue style={{ fontSize: 24 }}>${totalOwed.toFixed(0)}</StatValue>
          </HalfCard>
          <HalfCard>
            <StatLabel>You owe</StatLabel>
            <StatValue style={{ fontSize: 24, color: Colors.error }}>${totalIOwe.toFixed(0)}</StatValue>
          </HalfCard>
        </TwoColRow>

        {/* Monthly Bar Chart */}
        <SectionTitle>Monthly Spending</SectionTitle>
        <BarChartContainer>
          <BarsRow>
            {MONTHLY_SPENDING.map((m, i) => {
              const barH = Math.max(8, (m.amount / maxMonthly) * BAR_CHART_HEIGHT * 0.9);
              const isActive = i === activeIdx;
              return (
                <BarWrapper key={m.month}>
                  <Bar height={barH} active={isActive} />
                  <BarLabel active={isActive}>{m.month}</BarLabel>
                </BarWrapper>
              );
            })}
          </BarsRow>
        </BarChartContainer>

        {/* Category breakdown (Donut-style) */}
        <SectionTitle>Spending Breakdown</SectionTitle>
        <DonutContainer>
          <DonutContent>
            <DonutVisual>
              <DonutCenter>${totalSpent.toFixed(0)}</DonutCenter>
            </DonutVisual>
            <LegendList>
              {categoryData.map(item => (
                <LegendRow key={item.category}>
                  <LegendDot bgColor={item.color} />
                  <LegendLabel>{item.category}</LegendLabel>
                  <LegendAmount>${item.amount.toFixed(0)}</LegendAmount>
                </LegendRow>
              ))}
            </LegendList>
          </DonutContent>
        </DonutContainer>

        {/* Total expenses stat */}
        <SectionTitle>Overview</SectionTitle>
        <TwoColRow>
          <HalfCard>
            <StatLabel>Total expenses</StatLabel>
            <StatValue style={{ fontSize: 28 }}>{MOCK_EXPENSES.length}</StatValue>
          </HalfCard>
          <HalfCard>
            <StatLabel>Total spent</StatLabel>
            <StatValue style={{ fontSize: 24 }}>${totalSpent.toFixed(0)}</StatValue>
          </HalfCard>
        </TwoColRow>
      </Content>
    </Container>
  );
}
