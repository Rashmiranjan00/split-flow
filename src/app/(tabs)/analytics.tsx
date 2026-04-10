import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Dimensions, View } from 'react-native';
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
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useExpenseStore } from '@/features/expenses/store';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const BAR_CHART_HEIGHT = 140;

const StatCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.xl}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
`;

const HalfCard = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
`;

const BarChartContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  padding-bottom: ${Spacing.md}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
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
  background-color: ${({ active, theme }: BarProps & { theme: any }) => active ? theme.colors.primary : theme.colors.surfaceContainerHigh};
  margin-bottom: ${Spacing.xs}px;
`;

interface ActiveProps {
  active: boolean;
}

const BarLabel = styled(BodySm)<ActiveProps>`
  color: ${({ active, theme }: ActiveProps & { theme: any }) => active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-size: 10px;
  font-weight: ${({ active }: ActiveProps) => active ? '700' : '400'};
`;

const DonutContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
`;

const DonutVisual = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border-width: 16px;
  border-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
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
  const theme = useTheme();
  const { netBalance, totalOwedToYou, totalYouOwe } = useBalances();
  const allExpenses = useExpenseStore(s => s.expenses);
  const { formatCurrency } = useCurrencyFormatter();

  const spendingByCategory = React.useMemo(() => {
    const categoryColors: Record<string, string> = {
      Food: '#ffb783',
      Transport: '#c0c1ff',
      Accommodation: '#c7c4d7',
      Utilities: '#f59e0b',
      Housing: '#ef4444',
      Other: '#6b7280',
    };

    const totals = allExpenses.reduce<Record<string, number>>((acc, exp) => {
      const splitDetails = exp.splitDetails || [];
      const myShare = splitDetails.find(s => s.userId === userId)?.owedAmount ?? 0;
      const cat = exp.category ?? 'Other';
      acc[cat] = (acc[cat] || 0) + myShare;
      return acc;
    }, {});

    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] || categoryColors['Other'],
    }));
  }, [allExpenses, userId]);

  const totalSpent = React.useMemo(() => 
    allExpenses
      .flatMap(e => e.splitDetails || [])
      .filter(s => s.userId === userId)
      .reduce((sum, s) => sum + s.owedAmount, 0),
    [allExpenses, userId]
  );

  // Mock monthly spending still used as we don't have historical data in store yet
  const MONTHLY_SPENDING_MOCK = [
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: totalSpent },
  ];

  const maxMonthly = Math.max(...MONTHLY_SPENDING_MOCK.map(m => m.amount)) || 1;
  const activeIdx = MONTHLY_SPENDING_MOCK.length - 1;

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.lg }}>
          <Headline style={{ marginBottom: Spacing.xl }}>Insights</Headline>

          <StatCard>
            <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Net Balance</Label>
            <SpaceBetweenRow>
              <Display positive={netBalance >= 0}>
                {formatCurrency(Math.abs(netBalance))}
              </Display>
              <BodyMd style={{ color: netBalance >= 0 ? theme.colors.tertiary : theme.colors.error, fontWeight: '600' }}>
                {netBalance >= 0 ? '▲ Owed to you' : '▼ You owe'}
              </BodyMd>
            </SpaceBetweenRow>
          </StatCard>

          <Row style={{ gap: Spacing.md, marginBottom: Spacing.md }}>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>They owe you</Label>
              <Title style={{ fontSize: 24 }}>{formatCurrency(totalOwedToYou)}</Title>
            </HalfCard>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>You owe</Label>
              <Title style={{ fontSize: 24, color: theme.colors.error }}>{formatCurrency(totalYouOwe)}</Title>
            </HalfCard>
          </Row>

          <Title style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Monthly Spending</Title>
          <BarChartContainer>
            <BarsRow>
              {MONTHLY_SPENDING_MOCK.map((m, i) => {
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
                <Title>{formatCurrency(totalSpent, { decimals: 0 })}</Title>
              </DonutVisual>
              <View style={{ flex: 1 }}>
                {spendingByCategory.map(item => (
                  <Row key={item.category} style={{ marginBottom: 4 }}>
                    <LegendDot bgColor={item.color} />
                    <BodySm style={{ flex: 1 }}>{item.category}</BodySm>
                    <BodySm style={{ fontWeight: '600' }}>{formatCurrency(item.amount, { decimals: 0 })}</BodySm>
                  </Row>
                ))}
              </View>
            </Row>
          </DonutContainer>

          <Title style={{ marginTop: Spacing.lg, marginBottom: Spacing.md }}>Overview</Title>
          <Row style={{ gap: Spacing.md }}>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Expenses</Label>
              <Display style={{ fontSize: 28 }}>{allExpenses.length}</Display>
            </HalfCard>
            <HalfCard>
              <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Total spent</Label>
              <Title style={{ fontSize: 24 }}>{formatCurrency(totalSpent, { decimals: 0 })}</Title>
            </HalfCard>
          </Row>

          <Spacer size="xxxl" />
        </View>
      </Content>
    </Screen>
  );
};

export default AnalyticsScreen;
