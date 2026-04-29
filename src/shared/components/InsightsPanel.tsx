import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Receipt, CheckCircle2, Users } from 'lucide-react-native';
import { Typography } from '@/shared/constants/typography';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useActivity, type ActivityItemData } from '@/features/activity/hooks/useActivity';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';

const PANEL_WIDTH = 320;

export const InsightsPanel: React.FC = React.memo(() => {
  return (
    <Container>
      <QuickBalancesSection />
      <RecentActivitySection />
      <GroupSummarySection />
    </Container>
  );
});

InsightsPanel.displayName = 'InsightsPanel';

// --- Quick Balances Section ---

const QuickBalancesSection: React.FC = () => {
  const theme = useTheme();
  const { netBalance, totalOwedToYou, totalYouOwe, isLoading } = useBalances();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) return null;

  const isPositive = netBalance >= 0;

  return (
    <Section>
      <SectionTitle>Quick Balances</SectionTitle>
      <BalanceCardWrap>
        <BalanceRow>
          <BalanceLabel>Net Balance</BalanceLabel>
          <BalanceValue $positive={isPositive}>
            {isPositive ? '+' : '-'}
            {formatCurrency(Math.abs(netBalance), { sign: false, decimals: 0 })}
          </BalanceValue>
        </BalanceRow>
        <Divider />
        <BalanceRow>
          <BalanceIndicator>
            <TrendingUp size={14} color={theme.colors.primary} />
            <BalanceSmLabel>Owed to you</BalanceSmLabel>
          </BalanceIndicator>
          <BalanceSmValue $positive>
            {formatCurrency(totalOwedToYou, { sign: false, decimals: 0 })}
          </BalanceSmValue>
        </BalanceRow>
        <BalanceRow>
          <BalanceIndicator>
            <TrendingDown size={14} color={theme.colors.danger} />
            <BalanceSmLabel>You owe</BalanceSmLabel>
          </BalanceIndicator>
          <BalanceSmValue $positive={false}>
            {formatCurrency(totalYouOwe, { sign: false, decimals: 0 })}
          </BalanceSmValue>
        </BalanceRow>
      </BalanceCardWrap>
    </Section>
  );
};

// --- Recent Activity Section ---

const RecentActivitySection: React.FC = () => {
  const theme = useTheme();
  const { recent, isLoading, isEmpty } = useActivity();
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();
  const router = useRouter();

  if (isLoading) return null;

  const items = recent.slice(0, 5);

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Recent Activity</SectionTitle>
        <SeeAllButton onPress={() => router.push('/(tabs)/activity' as any)}>
          <SeeAllText>See all</SeeAllText>
        </SeeAllButton>
      </SectionHeader>
      {isEmpty ? (
        <EmptyText>No activity yet</EmptyText>
      ) : (
        items.map((item, idx) => (
          <ActivityRow key={item.id} $isLast={idx === items.length - 1}>
            <ActivityIcon type={item.type} />
            <ActivityContent>
              <ActivityTitle numberOfLines={1}>{item.title}</ActivityTitle>
              <ActivityMeta>{formatDate(item.date)}</ActivityMeta>
            </ActivityContent>
            <ActivityAmount $positive={item.amount >= 0}>
              {item.amount >= 0 ? '+' : ''}
              {formatCurrency(Math.abs(item.amount), { sign: false, decimals: 0 })}
            </ActivityAmount>
          </ActivityRow>
        ))
      )}
    </Section>
  );
};

const ActivityIcon: React.FC<{ type: ActivityItemData['type'] }> = ({ type }) => {
  const theme = useTheme();
  const isExpense = type === 'EXPENSE';
  const Icon = isExpense ? Receipt : CheckCircle2;
  const bgColor = isExpense
    ? theme.colors.surfaceContainerHigh
    : theme.colors.primaryFixedDim + '33';

  return (
    <IconCircle style={{ backgroundColor: bgColor }}>
      <Icon size={14} color={isExpense ? theme.colors.onSurfaceVariant : theme.colors.primary} />
    </IconCircle>
  );
};

// --- Group Summary Section ---

const GroupSummarySection: React.FC = () => {
  const theme = useTheme();
  const { groups, totalGroups, isLoading } = useGroups();
  const router = useRouter();

  if (isLoading) return null;

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Groups</SectionTitle>
        <GroupCount>{totalGroups}</GroupCount>
      </SectionHeader>
      {totalGroups === 0 ? (
        <EmptyText>No groups yet</EmptyText>
      ) : (
        <ChipContainer>
          {groups.slice(0, 6).map((group) => (
            <GroupChip
              key={group.id}
              onPress={() => router.push(`/group/${group.id}` as any)}
              activeOpacity={0.7}>
              <Users size={12} color={theme.colors.onSurfaceVariant} />
              <ChipLabel numberOfLines={1}>{group.name}</ChipLabel>
            </GroupChip>
          ))}
          {totalGroups > 6 && (
            <GroupChip onPress={() => router.push('/(tabs)/groups' as any)} activeOpacity={0.7}>
              <ChipLabel>+{totalGroups - 6} more</ChipLabel>
            </GroupChip>
          )}
        </ChipContainer>
      )}
    </Section>
  );
};

// --- Styled Components ---

const Container = styled.ScrollView.attrs(() => ({
  contentContainerStyle: { paddingBottom: 24 },
  showsVerticalScrollIndicator: false,
}))`
  width: ${PANEL_WIDTH}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-left-width: 1px;
  border-left-color: ${({ theme }) => theme.colors.divider};
  padding-top: ${Spacing.xl}px;
`;

const Section = styled.View`
  padding-horizontal: ${Spacing.md}px;
  margin-bottom: ${Spacing.lg}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${Spacing.sm}px;
`;

const SectionTitle = styled.Text`
  font-family: ${Typography.fonts.semibold};
  font-size: ${Typography.sizes.labelLg}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${Spacing.sm}px;
`;

const SeeAllButton = styled.TouchableOpacity`
  margin-bottom: ${Spacing.sm}px;
`;

const SeeAllText = styled.Text`
  font-family: ${Typography.fonts.medium};
  font-size: ${Typography.sizes.labelMd}px;
  color: ${({ theme }) => theme.colors.primary};
`;

// Balance styles
const BalanceCardWrap = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.cardRadius}px;
  padding: ${Spacing.md}px;
`;

const BalanceRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${Spacing.xs}px;
`;

const BalanceLabel = styled.Text`
  font-family: ${Typography.fonts.medium};
  font-size: ${Typography.sizes.bodySm}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const BalanceValue = styled.Text<{ $positive: boolean }>`
  font-family: ${Typography.fonts.bold};
  font-size: ${Typography.sizes.titleMd}px;
  color: ${({ theme, $positive }) => ($positive ? theme.colors.primary : theme.colors.danger)};
`;

const BalanceIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const BalanceSmLabel = styled.Text`
  font-family: ${Typography.fonts.regular};
  font-size: ${Typography.sizes.labelMd}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const BalanceSmValue = styled.Text<{ $positive: boolean }>`
  font-family: ${Typography.fonts.semibold};
  font-size: ${Typography.sizes.bodySm}px;
  color: ${({ theme, $positive }) => ($positive ? theme.colors.primary : theme.colors.danger)};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-vertical: ${Spacing.sm}px;
`;

// Activity styles
const ActivityRow = styled.View<{ $isLast: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${Spacing.sm}px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

const IconCircle = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.sm}px;
`;

const ActivityContent = styled.View`
  flex: 1;
  min-width: 0;
`;

const ActivityTitle = styled.Text`
  font-family: ${Typography.fonts.medium};
  font-size: ${Typography.sizes.bodySm}px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ActivityMeta = styled.Text`
  font-family: ${Typography.fonts.regular};
  font-size: ${Typography.sizes.labelSm}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-top: 2px;
`;

const ActivityAmount = styled.Text<{ $positive: boolean }>`
  font-family: ${Typography.fonts.semibold};
  font-size: ${Typography.sizes.bodySm}px;
  color: ${({ theme, $positive }) => ($positive ? theme.colors.primary : theme.colors.danger)};
  margin-left: ${Spacing.sm}px;
`;

// Group styles
const GroupCount = styled.Text`
  font-family: ${Typography.fonts.semibold};
  font-size: ${Typography.sizes.labelMd}px;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryFixedDim}33;
  padding: 2px 8px;
  border-radius: ${Radius.full}px;
  margin-bottom: ${Spacing.sm}px;
  overflow: hidden;
`;

const ChipContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${Spacing.sm}px;
`;

const GroupChip = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.full}px;
`;

const ChipLabel = styled.Text`
  font-family: ${Typography.fonts.medium};
  font-size: ${Typography.sizes.labelMd}px;
  color: ${({ theme }) => theme.colors.onSurface};
  max-width: 120px;
`;

const EmptyText = styled.Text`
  font-family: ${Typography.fonts.regular};
  font-size: ${Typography.sizes.bodySm}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;
