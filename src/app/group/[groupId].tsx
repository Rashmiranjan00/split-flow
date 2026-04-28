import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, Plane, Home as HomeIcon, UtensilsCrossed, Briefcase, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  SafeScreen,
  Content,
  Row,
  SectionHeader,
  SpaceBetweenRow,
  Spacer,
  TxnRow,
} from '@/shared/components/Layout';
import {
  BodyMd,
  RowSubtitle,
  RowTitle,
  Timestamp,
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { useUser } from '@/shared/hooks/useUser';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { useGroup } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useGroupBalances } from '@/features/balances/hooks/useGroupBalances';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { queryKeys } from '@/services/supabase/queryKeys';
import { listExpensesByGroup } from '@/services/supabase/expenses';

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

const getGroupIcon = (name: string): LucideIcon => {
  const lower = name.toLowerCase();
  if (lower.includes('trip')) return Plane;
  if (lower.includes('home') || lower.includes('house')) return HomeIcon;
  if (lower.includes('food') || lower.includes('dinner')) return UtensilsCrossed;
  return Briefcase;
};

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { group } = useGroup(groupId ?? '');
  const { friends } = useFriends();
  const { userId, user } = useUser();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();
  const { netPositions, simplifiedDebts } = useGroupBalances(groupId ?? '');
  const router = useRouter();
  const theme = useTheme();

  const { data: groupExpenses = [] } = useQuery({
    queryKey: queryKeys.expenses(groupId ?? ''),
    queryFn: () => listExpensesByGroup(groupId ?? ''),
    enabled: !!groupId,
    select: (data) =>
      [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
  });

  if (!group) return null;

  const balance = netPositions[userId] || 0;
  const isPositive = balance >= 0;
  const displayName = group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

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
          onPress={() =>
            router.push(`/group/add-members?groupId=${groupId}` as any)
          }
          accessibilityRole="button"
          accessibilityLabel="Add members"
        >
          <UserPlus size={22} color={theme.colors.onSurface} />
        </IconButton>
      </HeaderBar>

      <Content showsVerticalScrollIndicator={false}>
        <HeroSection>
          <GroupIconWrap>
            {React.createElement(getGroupIcon(group.name), { size: 32, color: theme.colors.onSurfaceVariant })}
          </GroupIconWrap>
          <GroupName>{displayName}</GroupName>
          {group.description ? (
            <GroupDescription>{group.description}</GroupDescription>
          ) : null}
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
                  const debt = simplifiedDebts.find(
                    (d) => d.from === userId || d.to === userId
                  );
                  const targetId =
                    debt?.from === userId ? debt?.to : debt?.from;
                  if (targetId) {
                    router.push(
                      `/settle/${targetId}?groupId=${groupId}&amount=${Math.abs(
                        debt?.amount ?? 0
                      )}` as any
                    );
                  }
                }}
              >
                <SettleUpText>Settle up</SettleUpText>
              </SettleUpPill>
            </>
          )}
        </BalanceRow>

        <Divider />

        <SectionHeader label="Who owes what" />
        {simplifiedDebts.length === 0 ? (
          <View style={{ paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md }}>
            <RowSubtitle style={{ color: theme.colors.primary, fontWeight: '600' }}>
              All settled up!
            </RowSubtitle>
          </View>
        ) : (
          simplifiedDebts.map((debt, idx) => {
            const fromFriend = friends.find((f) => f.id === debt.from);
            const toFriend = friends.find((f) => f.id === debt.to);
            const fromName = debt.from === userId ? 'You' : fromFriend?.name ?? 'Someone';
            const toName = debt.to === userId ? 'you' : toFriend?.name ?? 'someone';
            const toUser = debt.to === userId;
            return (
              <TxnRow
                key={`${debt.from}-${debt.to}-${idx}`}
                isLast={idx === simplifiedDebts.length - 1}
                onPress={() => {}}
                leading={<Avatar name={fromFriend?.name ?? 'U'} size={Spacing.avatarSm} />}
                title={<RowTitle numberOfLines={1}>{`${fromName} owes ${toName}`}</RowTitle>}
                trailing={
                  <RowTitle style={{ color: toUser ? theme.colors.tertiary : theme.colors.danger }}>
                    {formatCurrency(debt.amount, { decimals: 0 })}
                  </RowTitle>
                }
              />
            );
          })
        )}

        <Spacer size="md" />

        <SectionHeader label={`Members · ${group.members.length}`} />
        {group.members.map((mid, idx) => {
          const member =
            friends.find((f) => f.id === mid) || (mid === userId ? user : null);
          return (
            <TxnRow
              key={mid}
              isLast={idx === group.members.length - 1}
              onPress={() => {}}
              leading={<Avatar name={member?.name ?? 'User'} size={Spacing.avatarSm} />}
              title={<RowTitle numberOfLines={1}>{member?.name ?? mid}</RowTitle>}
              trailing={
                mid === userId ? (
                  <RowSubtitle style={{ color: theme.colors.primary }}>You</RowSubtitle>
                ) : null
              }
            />
          );
        })}

        <Spacer size="md" />

        <SectionHeader label={`Expenses · ${groupExpenses.length}`} />
        {groupExpenses.length === 0 ? (
          <View style={{ paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md }}>
            <RowSubtitle>No expenses yet.</RowSubtitle>
          </View>
        ) : (
          groupExpenses.map((expense, idx) => {
            const payer =
              friends.find((f) => f.id === expense.paidBy) ||
              (expense.paidBy === userId ? user : null);
            const paidByLabel = expense.paidBy === userId ? 'You' : payer?.name ?? 'Someone';
            return (
              <TxnRow
                key={expense.id}
                isLast={idx === groupExpenses.length - 1}
                onPress={() => {}}
                leading={<Avatar name={expense.title} size={Spacing.avatarSm} />}
                title={<RowTitle numberOfLines={1}>{expense.title}</RowTitle>}
                subtitle={
                  <RowSubtitle numberOfLines={1}>
                    {paidByLabel} paid
                  </RowSubtitle>
                }
                trailing={
                  <>
                    <RowTitle>{formatCurrency(expense.amount, { decimals: 0 })}</RowTitle>
                    <Timestamp style={{ marginTop: 2 }}>{formatDate(expense.createdAt)}</Timestamp>
                  </>
                }
              />
            );
          })
        )}

        <Spacer size="xl" />
      </Content>

      <BottomCTA>
        <ActionButton title="Add Expense" onPress={() => router.push('/expense/add')} />
      </BottomCTA>
    </SafeScreen>
  );
};

export default GroupDetailScreen;
