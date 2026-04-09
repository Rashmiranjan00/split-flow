import React from 'react';
import styled from 'styled-components/native';
import { Dimensions, View } from 'react-native';
import { Colors } from '@/shared/constants/colors';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { 
  Screen, 
  Content, 
  Row, 
  SpaceBetweenRow, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Title, 
  BodyMd, 
  BodySm, 
  Label,
  Headline,
  Display
} from '@/shared/components/Typography';
import { 
  getSpendingByCategory, 
  getTotalBalance, 
  MONTHLY_SPENDING, 
  MOCK_EXPENSES
} from '@/shared/data/mockData';
import { ExpenseSplit } from '@/shared/types';
import { useUser } from '@/shared/hooks/useUser';

const BAR_CHART_HEIGHT = 140;

const StatCard = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.xl}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const HalfCard = styled.View`
  flex: 1;
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

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

interface BarProps {
  height: number;
  active: boolean;
}

const Bar = styled.View<BarProps>`
  width: 24px;
  height: ${(props: BarProps) => props.height}px;
  border-radius: 6px;
  background-color: ${(props: BarProps) => props.active ? Colors.primary : Colors.surfaceContainerHigh};
  margin-bottom: ${Spacing.xs}px;
`;

interface ActiveProps {
  active: boolean;
}

const BarLabel = styled(BodySm)<ActiveProps>`
  color: ${(props: ActiveProps) => props.active ? Colors.primary : Colors.onSurfaceVariant};
  font-size: 10px;
  font-weight: ${(props: ActiveProps) => props.active ? '700' : '400'};
`;

const DonutContainer = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
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

interface BgColorProps {
  bgColor: string;
}

const LegendDot = styled.View<BgColorProps>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props: BgColorProps) => props.bgColor};
  margin-right: ${Spacing.sm}px;
`;

const AnalyticsScreen = () => {
  const { userId } = useUser();
  const categoryData = getSpendingByCategory(userId);
  const totalBalance = getTotalBalance(userId);

  const totalSpent = React.useMemo(() => 
    MOCK_EXPENSES
      .flatMap(e => e.splits)
      .filter((s: ExpenseSplit) => s.userId === userId)
      .reduce((sum, s) => sum + s.value, 0),
    [userId]
  );

  const totalOwed = React.useMemo(() => 
    MOCK_EXPENSES
      .filter(e => e.payerId === userId)
      .reduce((sum, e) => {
        const myShare = e.splits.find((s: ExpenseSplit) => s.userId === userId)?.value ?? 0;
        return sum + (e.amount - myShare);
      }, 0),
    [userId]
  );

  const totalIOwe = React.useMemo(() => 
    MOCK_EXPENSES
      .filter(e => e.payerId !== userId)
      .flatMap(e => e.splits)
      .filter((s: ExpenseSplit) => s.userId === userId)
      .reduce((sum, s) => sum + s.value, 0),
    [userId]
  );

  const maxMonthly = Math.max(...MONTHLY_SPENDING.map(m => m.amount));
  const activeIdx = MONTHLY_SPENDING.length - 1;

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.lg }}>
          <Headline style={{ marginBottom: Spacing.xl }}>Insights</Headline>

          <StatCard>
            <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Net Balance</Label>
            <SpaceBetweenRow>
              <Display positive={totalBalance >= 0}>
                ${Math.abs(totalBalance).toFixed(2)}
              </Display>
              <BodyMd style={{ color: totalBalance >= 0 ? Colors.tertiary : Colors.error, fontWeight: '600' }}>
                {totalBalance >= 0 ? '▲ Owed to you' : '▼ You owe'}
              </BodyMd>
            </SpaceBetweenRow>
          </StatCard>

          <Row style={{ gap: Spacing.md, marginBottom: Spacing.md }}>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>They owe you</Label>
              <Title style={{ fontSize: 24 }}>${totalOwed.toFixed(0)}</Title>
            </HalfCard>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>You owe</Label>
              <Title style={{ fontSize: 24, color: Colors.error }}>${totalIOwe.toFixed(0)}</Title>
            </HalfCard>
          </Row>

          <Title style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Monthly Spending</Title>
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

          <Title style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Spending Breakdown</Title>
          <DonutContainer>
            <Row>
              <DonutVisual>
                <Title>${totalSpent.toFixed(0)}</Title>
              </DonutVisual>
              <View style={{ flex: 1 }}>
                {categoryData.map(item => (
                  <Row key={item.category} style={{ marginBottom: 4 }}>
                    <LegendDot bgColor={item.color} />
                    <BodySm style={{ flex: 1 }}>{item.category}</BodySm>
                    <BodySm style={{ fontWeight: '600' }}>${item.amount.toFixed(0)}</BodySm>
                  </Row>
                ))}
              </View>
            </Row>
          </DonutContainer>

          <Title style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Overview</Title>
          <Row style={{ gap: Spacing.md }}>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Expenses</Label>
              <Display style={{ fontSize: 28 }}>{MOCK_EXPENSES.length}</Display>
            </HalfCard>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Total spent</Label>
              <Title style={{ fontSize: 24 }}>${totalSpent.toFixed(0)}</Title>
            </HalfCard>
          </Row>

          <Spacer size="xxxl" />
        </View>
      </Content>
    </Screen>
  );
};

export default AnalyticsScreen;
