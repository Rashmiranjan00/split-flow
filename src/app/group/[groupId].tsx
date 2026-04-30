import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  UserPlus,
  MoreVertical,
  Trash2,
  Plane,
  Home as HomeIcon,
  UtensilsCrossed,
  Briefcase,
  type LucideIcon,
} from 'lucide-react-native';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Content, Row, Spacer, TxnRow } from '@/shared/components/Layout';
import { BodyMd, RowSubtitle, RowTitle, Timestamp } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { ScreenTabs } from '@/shared/components/ScreenTabs';
import { useUser } from '@/shared/hooks/useUser';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { useGroup } from '@/features/groups/hooks/useGroups';
import { useGroupMembers } from '@/features/groups/hooks/useGroupMembers';
import { useGroupBalances } from '@/features/balances/hooks/useGroupBalances';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useConfirmSheet } from '@/shared/hooks/useConfirmSheet';
import { useDeleteGroupMutation } from '@/features/groups/hooks/useGroupMutations';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listExpensesByGroup } from '@/services/supabase/expenses';
import { useGroupAnalytics } from '@/features/analytics/hooks/useGroupAnalytics';
import { StatCard } from '@/features/analytics/components/StatCard';
import { ChartCard } from '@/features/analytics/components/ChartCard';
import { CategoryPieChart } from '@/features/analytics/components/CategoryPieChart';
import {
  ContributionBarChart,
  type ContributionBar,
} from '@/features/analytics/components/ContributionBarChart';
import { SpendOverTimeChart } from '@/features/analytics/components/SpendOverTimeChart';
import { TopExpenseCard } from '@/features/analytics/components/TopExpenseCard';
import { InsightsEmptyState } from '@/features/analytics/components/InsightsEmptyState';
import { LoadingView } from '@/shared/components/LoadingView';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const IconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const HeaderTitleRow = styled.View`
  flex: 1;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const HeroSection = styled.View`
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.lg}px;
`;

const GroupIconWrap = styled.View`
  margin-bottom: ${Spacing.sm}px;
`;

const GroupName = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 20px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.3px;
`;

const GroupDescription = styled.Text`
  margin-top: 4px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const BalanceText = styled.Text<{ positive: boolean }>`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 18px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ positive, theme }: { positive: boolean; theme: any }) =>
    positive ? theme.colors.tertiary : theme.colors.danger};
  text-align: center;
`;

const BalanceRow = styled.View`
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.screenPadding}px;
`;

const SettleUpPill = styled.TouchableOpacity`
  margin-top: ${Spacing.md}px;
  padding: 10px 20px;
  border-radius: ${Radius.full}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const SettleUpText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 14px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.primary};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin: 0 ${Spacing.screenPadding}px;
`;

const BottomCTA = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.xl}px;
`;

const TabContent = styled.View`
  padding: 0 ${Spacing.screenPadding}px;
`;

const InsightsStack = styled.View`
  padding: 0 ${Spacing.screenPadding}px;
  gap: ${Spacing.md}px;
`;

const MenuOverlay = styled(Pressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
`;

const MenuPopover = styled.View`
  position: absolute;
  right: ${Spacing.screenPadding}px;
  top: 44px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${Radius.md}px;
  padding: ${Spacing.xs}px 0;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
  z-index: 11;
  min-width: 180px;
`;

const MenuItem = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px ${Spacing.md}px;
  gap: ${Spacing.sm}px;
`;

const MenuItemText = styled.Text<{ destructive?: boolean }>`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 15px;
  color: ${({ destructive, theme }) =>
    destructive ? theme.colors.danger : theme.colors.onSurface};
`;

const getGroupIcon = (name: string): LucideIcon => {
  const lower = name.toLowerCase();
  if (lower.includes('trip')) return Plane;
  if (lower.includes('home') || lower.includes('house')) return HomeIcon;
  if (lower.includes('food') || lower.includes('dinner')) return UtensilsCrossed;
  return Briefcase;
};

type GroupTabId = 'expenses' | 'balances' | 'members' | 'insights';

const TAB_ITEMS = [
  { id: 'expenses', label: 'Expenses' },
  { id: 'balances', label: 'Balances' },
  { id: 'members', label: 'Members' },
  { id: 'insights', label: 'Insights' },
];

const truncate = (text: string, max = 10): string =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const gid = groupId ?? '';
  const { group, isLoading: groupLoading } = useGroup(gid);
  const { members, isLoading: membersLoading } = useGroupMembers(gid);
  const { userId } = useUser();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();
  const { netPositions, simplifiedDebts } = useGroupBalances(gid);
  const analytics = useGroupAnalytics(gid);
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<GroupTabId>('expenses');
  const [menuOpen, setMenuOpen] = useState(false);
  const { show } = useConfirmSheet();
  const deleteGroupMutation = useDeleteGroupMutation();

  const isCreator = group?.createdBy === userId;

  const handleDeleteGroup = () => {
    setMenuOpen(false);
    show({
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group?.name}"? All expenses and settlements in this group will be permanently removed.`,
      actions: [
        {
          label: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteGroupMutation.mutate(gid, {
              onSuccess: () => router.replace('/(tabs)/groups'),
            });
          },
        },
        { label: 'Cancel', style: 'cancel', onPress: () => {} },
      ],
    });
  };

  const { data: groupExpenses = [] } = useQuery({
    queryKey: queryKeys.expenses(gid),
    queryFn: () => listExpensesByGroup(gid),
    enabled: !!gid,
    select: (data) =>
      [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });

  if (groupLoading || membersLoading) {
    return (
      <SafeScreen>
        <LoadingView message="Loading group..." />
      </SafeScreen>
    );
  }

  if (!group) return null;

  const balance = netPositions[userId] || 0;
  const isPositive = balance >= 0;
  const displayName = group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

  const memberById = new Map(members.map((m) => [m.id, m]));
  const lookupName = (uid: string): string => {
    if (uid === userId) return 'You';
    return memberById.get(uid)?.name ?? 'Someone';
  };

  const contributionData: ContributionBar[] = analytics.memberContribution.map((c) => ({
    id: c.userId,
    label: truncate(lookupName(c.userId)),
    amount: c.paid,
  }));

  const renderExpensesTab = () => {
    if (groupExpenses.length === 0) {
      return (
        <TabContent style={{ paddingVertical: Spacing.md }}>
          <RowSubtitle>No expenses yet.</RowSubtitle>
        </TabContent>
      );
    }
    return (
      <View>
        {groupExpenses.map((expense, idx) => {
          const paidByLabel =
            expense.paidBy === userId ? 'You' : (memberById.get(expense.paidBy)?.name ?? 'Someone');
          return (
            <TxnRow
              key={expense.id}
              isLast={idx === groupExpenses.length - 1}
              onPress={() => {}}
              leading={<Avatar name={expense.title} size={Spacing.avatarSm} />}
              title={<RowTitle numberOfLines={1}>{expense.title}</RowTitle>}
              subtitle={<RowSubtitle numberOfLines={1}>{`${paidByLabel} paid`}</RowSubtitle>}
              trailing={
                <>
                  <RowTitle>{formatCurrency(expense.amount, { decimals: 0 })}</RowTitle>
                  <Timestamp style={{ marginTop: 2 }}>{formatDate(expense.createdAt)}</Timestamp>
                </>
              }
            />
          );
        })}
      </View>
    );
  };

  const renderBalancesTab = () => {
    if (simplifiedDebts.length === 0) {
      return (
        <TabContent style={{ paddingVertical: Spacing.md }}>
          <RowSubtitle style={{ color: theme.colors.primary, fontWeight: '600' }}>
            All settled up!
          </RowSubtitle>
        </TabContent>
      );
    }
    return (
      <View>
        {simplifiedDebts.map((debt, idx) => {
          const fromName =
            debt.from === userId ? 'You' : (memberById.get(debt.from)?.name ?? 'Someone');
          const toName = debt.to === userId ? 'you' : (memberById.get(debt.to)?.name ?? 'someone');
          const paidToUser = debt.to === userId;
          return (
            <TxnRow
              key={`${debt.from}-${debt.to}-${idx}`}
              isLast={idx === simplifiedDebts.length - 1}
              onPress={() => {}}
              leading={
                <Avatar name={memberById.get(debt.from)?.name ?? 'U'} size={Spacing.avatarSm} />
              }
              title={<RowTitle numberOfLines={1}>{`${fromName} owes ${toName}`}</RowTitle>}
              trailing={
                <RowTitle
                  style={{ color: paidToUser ? theme.colors.tertiary : theme.colors.danger }}>
                  {formatCurrency(debt.amount, { decimals: 0 })}
                </RowTitle>
              }
            />
          );
        })}
      </View>
    );
  };

  const renderMembersTab = () => (
    <View>
      {group.members.map((mid, idx) => {
        const member = memberById.get(mid);
        return (
          <TxnRow
            key={mid}
            isLast={idx === group.members.length - 1}
            onPress={() => {}}
            leading={<Avatar name={member?.name ?? 'User'} size={Spacing.avatarSm} />}
            title={<RowTitle numberOfLines={1}>{member?.name ?? 'Member'}</RowTitle>}
            subtitle={
              member?.email ? (
                <RowSubtitle numberOfLines={1}>{member.email}</RowSubtitle>
              ) : undefined
            }
            trailing={
              mid === userId ? (
                <RowSubtitle style={{ color: theme.colors.primary }}>You</RowSubtitle>
              ) : null
            }
          />
        );
      })}
    </View>
  );

  const renderInsightsTab = () => {
    if (analytics.isEmpty) {
      return (
        <TabContent>
          <InsightsEmptyState title="No insights yet" message="Add expenses to see insights" />
        </TabContent>
      );
    }
    return (
      <InsightsStack>
        <Row style={{ gap: Spacing.md, marginBottom: 0 }}>
          <StatCard
            label="Total spend"
            value={formatCurrency(analytics.totalSpend, { decimals: 0 })}
            caption={`${analytics.expenseCount} expense${analytics.expenseCount === 1 ? '' : 's'}`}
          />
          <StatCard
            label="Settlements"
            value={String(analytics.settlementCount)}
            caption={analytics.settlementCount === 1 ? 'payment' : 'payments'}
          />
        </Row>

        <ChartCard title="Spending by category">
          {analytics.categoryBreakdown.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No category data"
              message="Tag expenses with a category"
            />
          ) : (
            <CategoryPieChart data={analytics.categoryBreakdown} />
          )}
        </ChartCard>

        <ChartCard title="Who paid what">
          {contributionData.length === 0 ? (
            <InsightsEmptyState compact title="No contributions yet" message="" />
          ) : (
            <ContributionBarChart data={contributionData} />
          )}
        </ChartCard>

        <ChartCard title="Spend over time">
          {analytics.spendOverTime.length < 2 ? (
            <InsightsEmptyState
              compact
              title="Not enough timeline data"
              message="Add more expenses across dates"
            />
          ) : (
            <SpendOverTimeChart data={analytics.spendOverTime} />
          )}
        </ChartCard>

        <TopExpenseCard expense={analytics.topExpense} />
        <Spacer size="md" />
      </InsightsStack>
    );
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitleRow>
          <HeaderTitle numberOfLines={1}>{displayName}</HeaderTitle>
        </HeaderTitleRow>
        <IconButton
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="More options">
          <MoreVertical size={22} color={theme.colors.onSurface} />
        </IconButton>
      </HeaderBar>

      {menuOpen && (
        <>
          <MenuOverlay onPress={() => setMenuOpen(false)} />
          <MenuPopover>
            <MenuItem
              onPress={() => {
                setMenuOpen(false);
                router.push(`/group/add-members?groupId=${gid}` as any);
              }}>
              <UserPlus size={18} color={theme.colors.onSurface} />
              <MenuItemText>Add Members</MenuItemText>
            </MenuItem>
            {isCreator && (
              <MenuItem onPress={handleDeleteGroup}>
                <Trash2 size={18} color={theme.colors.danger} />
                <MenuItemText destructive>Delete Group</MenuItemText>
              </MenuItem>
            )}
          </MenuPopover>
        </>
      )}

      <Content showsVerticalScrollIndicator={false}>
        <HeroSection>
          <GroupIconWrap>
            {React.createElement(getGroupIcon(group.name), {
              size: 32,
              color: theme.colors.onSurfaceVariant,
            })}
          </GroupIconWrap>
          <GroupName>{displayName}</GroupName>
          {group.description ? <GroupDescription>{group.description}</GroupDescription> : null}
        </HeroSection>

        <BalanceRow>
          {balance === 0 ? (
            <BodyMd style={{ color: theme.colors.onSurfaceVariant }}>
              You&apos;re all settled up in this group.
            </BodyMd>
          ) : (
            <>
              <BalanceText positive={isPositive}>
                {isPositive ? 'You are owed ' : 'You owe '}
                {formatCurrency(Math.abs(balance), { decimals: 0 })}
              </BalanceText>
              <SettleUpPill
                activeOpacity={0.7}
                onPress={() => {
                  const debt = simplifiedDebts.find((d) => d.from === userId || d.to === userId);
                  const targetId = debt?.from === userId ? debt?.to : debt?.from;
                  if (targetId) {
                    router.push(
                      `/settle/${targetId}?groupId=${gid}&amount=${Math.abs(
                        debt?.amount ?? 0
                      )}` as any
                    );
                  }
                }}>
                <SettleUpText>Settle up</SettleUpText>
              </SettleUpPill>
            </>
          )}
        </BalanceRow>

        <Divider />

        <ScreenTabs
          tabs={TAB_ITEMS}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as GroupTabId)}
        />

        {activeTab === 'expenses' ? renderExpensesTab() : null}
        {activeTab === 'balances' ? renderBalancesTab() : null}
        {activeTab === 'members' ? renderMembersTab() : null}
        {activeTab === 'insights' ? renderInsightsTab() : null}

        <Spacer size="xl" />
      </Content>

      <BottomCTA>
        <ActionButton title="Add Expense" onPress={() => router.push('/expense/add')} />
      </BottomCTA>
    </SafeScreen>
  );
};

export default GroupDetailScreen;
