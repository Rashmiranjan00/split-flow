import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  Screen,
  Content,
  Row,
  SpaceBetweenRow,
  Spacer,
} from '@/shared/components/Layout';
import { BodyMd, BodySm, SectionLabel } from '@/shared/components/Typography';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const BAR_CHART_HEIGHT = 140;

/**
 * Soft white card used across Analytics. Applies the Stitch ambient-shadow
 * elevation (0 1px 3px rgba(0,0,0,0.06)) instead of an outline border.
 */
const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-radius: ${Radius.cardRadius}px;
  padding: ${Spacing.md}px;
  shadow-color: #000000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.06;
  shadow-radius: 3px;
  elevation: 1;
`;

const HalfCard = styled(Card)`
  flex: 1;
`;

const HeaderRow = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px;
  margin-top: ${Spacing.md}px;
`;

const ScreenTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const StatValue = styled.Text<{ tone?: 'positive' | 'negative' | 'neutral' }>`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme, tone }) =>
    tone === 'positive'
      ? theme.colors.tertiary
      : tone === 'negative'
      ? theme.colors.danger
      : theme.colors.onSurface};
  letter-spacing: -0.3px;
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
  width: 22px;
  height: ${(props: BarProps) => props.height}px;
  border-radius: 6px;
  background-color: ${({ active, theme }: BarProps & { theme: any }) =>
    active ? theme.colors.brandAccent : theme.colors.surfaceContainerHigh};
  margin-bottom: ${Spacing.xs}px;
`;

interface ActiveProps {
  active: boolean;
}

const BarLabel = styled.Text<ActiveProps>`
  color: ${({ active, theme }: ActiveProps & { theme: any }) =>
    active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 10px;
  font-weight: ${({ active }: ActiveProps) => (active ? '700' : '500')};
`;

const DonutVisual = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  border-width: 14px;
  border-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
`;

const LegendDot = styled.View<{ bgColor: string }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props: { bgColor: string }) => props.bgColor};
  margin-right: ${Spacing.sm}px;
`;

const SectionTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.sm}px;
`;

const AnalyticsScreen = () => {
  const { userId } = useUser();
  const theme = useTheme();
  const { netBalance, totalOwedToYou, totalYouOwe } = useBalances();
  const { groups } = useGroups();
  const groupIds = React.useMemo(() => groups.map((g) => g.id), [groups]);
  const { data: allExpenses = [] } = useQuery({
    queryKey: ['all-expenses', groupIds],
    queryFn: async () => {
      const results = await Promise.all(groupIds.map((gid) => listExpensesByGroup(gid)));
      return results.flat();
    },
    enabled: groupIds.length > 0,
  });
  const { formatCurrency } = useCurrencyFormatter();

  // Palette aligned with "Warm Minimalist Finance" tokens.
  const categoryColors: Record<string, string> = {
    Food: theme.colors.brandAccent,
    Travel: theme.colors.primary,
    Accommodation: theme.colors.primaryFixedDim,
    Utilities: theme.colors.secondary,
    Housing: theme.colors.danger,
    Other: theme.colors.onSurfaceVariant,
  };

  const spendingByCategory = React.useMemo(() => {
    const totals = allExpenses.reduce<Record<string, number>>((acc, exp) => {
      const splitDetails = exp.splitDetails || [];
      const myShare = splitDetails.find((s) => s.userId === userId)?.owedAmount ?? 0;
      const cat = exp.category ?? 'Other';
      acc[cat] = (acc[cat] || 0) + myShare;
      return acc;
    }, {});

    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] || categoryColors.Other,
    }));
  }, [allExpenses, userId, categoryColors]);

  const totalSpent = React.useMemo(
    () =>
      allExpenses
        .flatMap((e) => e.splitDetails || [])
        .filter((s) => s.userId === userId)
        .reduce((sum, s) => sum + s.owedAmount, 0),
    [allExpenses, userId]
  );

  const MONTHLY_SPENDING_MOCK = [
    { month: 'Nov', amount: 0 },
    { month: 'Dec', amount: 0 },
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
    { month: 'Apr', amount: totalSpent },
  ];

  const maxMonthly = Math.max(...MONTHLY_SPENDING_MOCK.map((m) => m.amount)) || 1;
  const activeIdx = MONTHLY_SPENDING_MOCK.length - 1;

  const netTone: 'positive' | 'negative' | 'neutral' =
    netBalance > 0 ? 'positive' : netBalance < 0 ? 'negative' : 'neutral';

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderRow>
          <ScreenTitle>Insights</ScreenTitle>
        </HeaderRow>

        <View style={{ paddingHorizontal: Spacing.screenPadding }}>
          <Card>
            <SectionLabel style={{ marginBottom: 4, fontSize: 11 }}>Net balance</SectionLabel>
            <SpaceBetweenRow style={{ marginBottom: 0 }}>
              <StatValue tone={netTone}>
                {formatCurrency(Math.abs(netBalance))}
              </StatValue>
              <BodySm
                style={{
                  color: netBalance >= 0 ? theme.colors.tertiary : theme.colors.danger,
                  fontWeight: '600',
                }}
              >
                {netBalance === 0
                  ? 'All settled'
                  : netBalance > 0
                  ? 'Owed to you'
                  : 'You owe'}
              </BodySm>
            </SpaceBetweenRow>
          </Card>

          <Spacer size="md" />

          <Row style={{ gap: Spacing.md, marginBottom: 0 }}>
            <HalfCard>
              <SectionLabel style={{ marginBottom: 4, fontSize: 11 }}>They owe you</SectionLabel>
              <StatValue tone="positive">{formatCurrency(totalOwedToYou)}</StatValue>
            </HalfCard>
            <HalfCard>
              <SectionLabel style={{ marginBottom: 4, fontSize: 11 }}>You owe</SectionLabel>
              <StatValue tone="negative">{formatCurrency(totalYouOwe)}</StatValue>
            </HalfCard>
          </Row>

          <SectionTitle>Monthly spending</SectionTitle>
          <Card>
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
          </Card>

          <SectionTitle>Spending breakdown</SectionTitle>
          <Card>
            <Row style={{ marginBottom: 0 }}>
              <DonutVisual>
                <BodyMd style={{ fontWeight: '700' }}>
                  {formatCurrency(totalSpent, { decimals: 0 })}
                </BodyMd>
              </DonutVisual>
              <View style={{ flex: 1 }}>
                {spendingByCategory.length === 0 ? (
                  <BodySm style={{ color: theme.colors.onSurfaceVariant }}>
                    No spending yet.
                  </BodySm>
                ) : (
                  spendingByCategory.map((item) => (
                    <Row key={item.category} style={{ marginBottom: 4 }}>
                      <LegendDot bgColor={item.color} />
                      <BodySm style={{ flex: 1 }}>{item.category}</BodySm>
                      <BodySm style={{ fontWeight: '600' }}>
                        {formatCurrency(item.amount, { decimals: 0 })}
                      </BodySm>
                    </Row>
                  ))
                )}
              </View>
            </Row>
          </Card>

          <SectionTitle>Overview</SectionTitle>
          <Row style={{ gap: Spacing.md }}>
            <HalfCard>
              <SectionLabel style={{ marginBottom: 4, fontSize: 11 }}>Expenses</SectionLabel>
              <StatValue tone="positive">{allExpenses.length}</StatValue>
            </HalfCard>
            <HalfCard>
              <SectionLabel style={{ marginBottom: 4, fontSize: 11 }}>Total spent</SectionLabel>
              <StatValue>{formatCurrency(totalSpent, { decimals: 0 })}</StatValue>
            </HalfCard>
          </Row>

          <Spacer size="xxxl" />
        </View>
      </Content>
    </Screen>
  );
};

export default AnalyticsScreen;
