import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import {
  MOCK_GROUPS,
  MOCK_EXPENSES,
  MOCK_MEMBERS,
  getGroupBalance,
  getGroupMemberBalances,
} from '@/data/mockData';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.lg}px;
`;

const BackBtn = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.sm}px;
`;

const GroupTitleText = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
  flex: 1;
`;

const HeroBanner = styled.View`
  background-color: ${Colors.primaryContainer};
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
  align-items: center;
  margin-bottom: ${Spacing.xl}px;
`;

const GroupEmojiLarge = styled.Text`
  font-size: 56px;
  margin-bottom: ${Spacing.sm}px;
`;

const GroupNameLarge = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.headlineMd}px;
  font-weight: ${Typography.weights.bold};
  text-align: center;
`;

const GroupDescText = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  opacity: 0.7;
  margin-top: 4px;
`;

const BalanceBanner = styled.View`
  padding-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.xl}px;
`;

const BalanceCard = styled.View<{ positive: boolean }>`
  background-color: ${({ positive }: { positive: boolean }) =>
    positive ? 'rgba(60,221,199,0.1)' : 'rgba(255,180,171,0.1)'};
  border-width: 1px;
  border-color: ${({ positive }: { positive: boolean }) =>
    positive ? Colors.tertiary : Colors.error};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  align-items: center;
`;

const BalanceLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${Spacing.xs}px;
`;

const BalanceValue = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean }) => positive ? Colors.tertiary : Colors.error};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
`;

const SectionPad = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${Spacing.sm}px;
  margin-top: ${Spacing.lg}px;
`;

const MemberRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

const MemberAvatar = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${Colors.surfaceContainerHigh};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const MemberInitial = styled.Text`
  color: ${Colors.onSurface};
  font-size: 16px;
  font-weight: 700;
`;

const MemberName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  flex: 1;
`;

const MemberBalance = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean }) => positive ? Colors.tertiary : Colors.error};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
`;

const ExpenseRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

const ExpenseIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background-color: ${Colors.surfaceContainerHigh};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const ExpenseEmoji = styled.Text`
  font-size: 18px;
`;

const ExpenseInfo = styled.View`
  flex: 1;
`;

const ExpenseName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const ExpenseMeta = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-top: 2px;
`;

const ExpenseAmount = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

const AddExpenseBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.md}px;
  margin: ${Spacing.lg}px;
  background-color: ${Colors.primaryContainer};
  border-radius: ${Radius.lg}px;
  gap: ${Spacing.sm}px;
`;

const AddExpenseBtnText = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const getCategoryEmoji = (cat?: string) => {
  const map: Record<string, string> = {
    Food: '🍽', Transport: '🚗', Accommodation: '🏠',
    Utilities: '⚡', Housing: '🏠', Other: '💳',
  };
  return map[cat ?? 'Other'] ?? '💳';
};

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  const group = MOCK_GROUPS.find(g => g.id === groupId);
  if (!group) return null;

  const balance = getGroupBalance(groupId, 'usr_1');
  const isPositive = balance >= 0;
  const memberBalances = getGroupMemberBalances(groupId, 'usr_1');
  const groupExpenses = MOCK_EXPENSES
    .filter(e => e.groupId === groupId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGroupEmoji = (name: string) => {
    if (name.includes('🏖')) return '🏖';
    if (name.includes('🏠')) return '🏠';
    if (name.includes('🍽')) return '🍽';
    return '💼';
  };

  return (
    <Container edges={['top']}>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </BackBtn>
        <GroupTitleText numberOfLines={1}>{group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}</GroupTitleText>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroBanner>
          <GroupEmojiLarge>{getGroupEmoji(group.name)}</GroupEmojiLarge>
          <GroupNameLarge>{group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}</GroupNameLarge>
          <GroupDescText>{group.description}</GroupDescText>
        </HeroBanner>

        {/* Your balance */}
        <BalanceBanner>
          <BalanceCard positive={isPositive}>
            <BalanceLabel>{isPositive ? 'You are owed' : 'You owe in total'}</BalanceLabel>
            <BalanceValue positive={isPositive}>
              {isPositive ? '+' : '-'}${Math.abs(balance).toFixed(2)}
            </BalanceValue>
          </BalanceCard>
        </BalanceBanner>

        {/* Member balances */}
        <SectionPad>
          <SectionTitle>Balances</SectionTitle>
          {memberBalances.length === 0 ? (
            <MemberBalance positive style={{ color: Colors.tertiary, paddingVertical: Spacing.sm }}>
              ✓ All settled up!
            </MemberBalance>
          ) : (
            memberBalances.map(mb => (
              <MemberRow key={mb.userId}>
                <MemberAvatar>
                  <MemberInitial>{mb.name[0].toUpperCase()}</MemberInitial>
                </MemberAvatar>
                <MemberName>{mb.name}</MemberName>
                <MemberBalance positive={mb.amount > 0}>
                  {mb.amount > 0 ? `owes you $${mb.amount.toFixed(2)}` : `you owe $${Math.abs(mb.amount).toFixed(2)}`}
                </MemberBalance>
              </MemberRow>
            ))
          )}

          {/* Members list */}
          <SectionTitle>Members ({group.members.length})</SectionTitle>
          {group.members.map(userId => {
            const member = MOCK_MEMBERS.find(m => m.id === userId);
            return (
              <MemberRow key={userId}>
                <MemberAvatar>
                  <MemberInitial>{(member?.name?.[0] ?? '?').toUpperCase()}</MemberInitial>
                </MemberAvatar>
                <MemberName>{member?.name ?? userId}</MemberName>
                {userId === 'usr_1' && (
                  <MaterialIcons name="star" size={16} color={Colors.primary} />
                )}
              </MemberRow>
            );
          })}

          {/* Expenses */}
          <SectionTitle>Expenses ({groupExpenses.length})</SectionTitle>
          {groupExpenses.map(expense => {
            const payer = MOCK_MEMBERS.find(m => m.id === expense.payerId);
            return (
              <ExpenseRow key={expense.id}>
                <ExpenseIcon>
                  <ExpenseEmoji>{getCategoryEmoji(expense.category)}</ExpenseEmoji>
                </ExpenseIcon>
                <ExpenseInfo>
                  <ExpenseName>{expense.title}</ExpenseName>
                  <ExpenseMeta>
                    {expense.payerId === 'usr_1' ? 'You' : payer?.name} paid · {formatDate(expense.date)}
                  </ExpenseMeta>
                </ExpenseInfo>
                <ExpenseAmount>${expense.amount.toFixed(2)}</ExpenseAmount>
              </ExpenseRow>
            );
          })}
        </SectionPad>

        <AddExpenseBtn onPress={() => router.push('/expense/add')} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color={Colors.primary} />
          <AddExpenseBtnText>Add Expense</AddExpenseBtnText>
        </AddExpenseBtn>
      </ScrollView>
    </Container>
  );
};

export default GroupDetailScreen;
