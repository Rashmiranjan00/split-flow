import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { 
  SafeScreen, 
  Content, 
  Row, 
  SpaceBetweenRow, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Display, 
  Headline, 
  Title, 
  BodyMd, 
  BodySm, 
  Label 
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard';
import { useUser } from '@/shared/hooks/useUser';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { useGroups, useGroup } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useGroupBalances } from '@/features/balances/hooks/useGroupBalances';
import { useExpenseStore } from '@/features/expenses/store';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Header = styled(Row)`
  padding: ${Spacing.md}px ${Spacing.lg}px;
  margin-bottom: 0;
`;

const BackBtn = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.sm}px;
`;

const HeroBanner = styled.View`
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
  align-items: center;
  margin-bottom: ${Spacing.xl}px;
`;

const GroupEmojiLarge = styled.Text`
  font-size: 56px;
  margin-bottom: ${Spacing.sm}px;
`;

const BalanceBanner = styled.View`
  padding-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.xl}px;
`;

interface PositiveProps {
  positive: boolean;
  tertiaryColor: string;
  errorColor: string;
}

const BalanceCardStyled = styled.View<PositiveProps>`
  background-color: ${(props: PositiveProps) =>
    props.positive ? props.tertiaryColor + '1A' : props.errorColor + '1A'};
  border-width: 1px;
  border-color: ${(props: PositiveProps) =>
    props.positive ? props.tertiaryColor : props.errorColor};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  align-items: center;
`;

const SectionPad = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const MemberRow = styled(SpaceBetweenRow)`
  padding: ${Spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-bottom: 0;
`;

const MemberBalance = styled(BodySm)<{ positive: boolean }>`
  color: ${({ positive, theme }: { positive: boolean; theme: any }) => positive ? theme.colors.tertiary : theme.colors.error};
  font-weight: 600;
`;

const AddExpenseBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.md}px;
  margin: ${Spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  border-radius: ${Radius.lg}px;
  gap: ${Spacing.sm}px;
`;

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const groups = useGroupStore(state => state.groups);
  const currentGroupId = groupId || (groups.length > 0 ? groups[0].id : '');
  const currentGroup = groups.find(g => g.id === currentGroupId);
  
  // Get all members for selection
  const groupMembers = currentGroup ? currentGroup.members : [];
  const theme = useTheme();

  const { userId, user } = useUser();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();

  const { group } = useGroup(groupId!);
  const { friends } = useFriends();
  const allExpenses = useExpenseStore(s => s.expenses);
  const { netPositions, simplifiedDebts } = useGroupBalances(groupId!);
  
  if (!group) return null;

  const balance = netPositions[userId] || 0;
  const isPositive = balance >= 0;

  const groupExpenses = React.useMemo(() => 
    allExpenses
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allExpenses, groupId]
  );

  const getGroupEmoji = (name: string) => {
    if (name.includes('🏖')) return '🏖';
    if (name.includes('🏠')) return '🏠';
    if (name.includes('🍽')) return '🍽';
    return '💼';
  };
  const displayName = group?.name?.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim() ?? 'Vault';

  return (
    <SafeScreen>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </BackBtn>
        <Title numberOfLines={1} style={{ flex: 1 }}>
          {displayName}
        </Title>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        <HeroBanner>
          <GroupEmojiLarge>{getGroupEmoji(group.name)}</GroupEmojiLarge>
          <Headline style={{ color: theme.colors.primary }}>
            {group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}
          </Headline>
          <BodySm style={{ color: theme.colors.primary, opacity: 0.7 }}>
            {group.description}
          </BodySm>
        </HeroBanner>

        <BalanceBanner>
          <BalanceCardStyled
            positive={isPositive}
            tertiaryColor={theme.colors.tertiary}
            errorColor={theme.colors.error}
          >
            <Label style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isPositive ? 'You are owed' : 'You owe in total'}
            </Label>
            <Display style={{ color: isPositive ? theme.colors.tertiary : theme.colors.error }}>
              {isPositive ? '+' : '-'}${Math.abs(balance).toFixed(2)}
            </Display>
          </BalanceCardStyled>
        </BalanceBanner>

        <SectionPad>
          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Balances
          </Label>
          {simplifiedDebts.length === 0 ? (
            <BodySm style={{ color: theme.colors.tertiary, paddingVertical: Spacing.sm, fontWeight: '600' }}>
              ✓ All settled up!
            </BodySm>
          ) : (
            simplifiedDebts.map((debt, idx) => {
              const fromFriend = friends.find(f => f.id === debt.from);
              const toFriend = friends.find(f => f.id === debt.to);
              
              const fromName = debt.from === userId ? 'You' : fromFriend?.name ?? 'Someone';
              const toName = debt.to === userId ? 'you' : toFriend?.name ?? 'someone';
              const isRelevant = debt.from === userId || debt.to === userId;

              return (
                <MemberRow key={`${debt.from}-${debt.to}-${idx}`}>
                  <Row style={{ marginBottom: 0, opacity: isRelevant ? 1 : 0.6 }}>
                    <Avatar name={fromFriend?.name ?? 'U'} size={32} />
                    <Spacer size="sm" horizontal />
                    <BodyMd style={{ fontWeight: '500' }}>
                      {fromName} owe {toName}
                    </BodyMd>
                  </Row>
                  <MemberBalance positive={debt.to === userId}>
                    {formatCurrency(debt.amount)}
                  </MemberBalance>
                </MemberRow>
              );
            })
          )}

          <Spacer size="lg" />

          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Members ({group.members.length})
          </Label>
          {group.members.map(mid => {
            const member = friends.find(f => f.id === mid) || (mid === userId ? user : null);
            return (
              <MemberRow key={mid}>
                <Row style={{ marginBottom: 0 }}>
                  <Avatar name={member?.name ?? 'User'} size={40} />
                  <Spacer size="md" horizontal />
                  <BodyMd style={{ fontWeight: '500' }}>{member?.name ?? mid}</BodyMd>
                  {mid === userId && (
                    <>
                      <Spacer size="xs" horizontal />
                      <MaterialIcons name="star" size={16} color={theme.colors.primary} />
                    </>
                  )}
                </Row>
              </MemberRow>
            );
          })}

          <Spacer size="lg" />

          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Expenses ({groupExpenses.length})
          </Label>
          {groupExpenses.map(expense => {
            const payer = friends.find(f => f.id === expense.paidBy) || (expense.paidBy === userId ? user : null);
            return (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                subtitle={`${expense.paidBy === userId ? 'You' : payer?.name} paid · ${formatDate(expense.createdAt)}`}
                amount={expense.amount}
                date={formatDate(expense.createdAt)}
                onPress={() => {}}
              />
            );
          })}
        </SectionPad>

        <AddExpenseBtn onPress={() => router.push('/expense/add')} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          <BodyMd style={{ color: theme.colors.primary, fontWeight: '600' }}>Add Expense</BodyMd>
        </AddExpenseBtn>

        <Spacer size="xxl" />
      </Content>
    </SafeScreen>
  );
};

export default GroupDetailScreen;
