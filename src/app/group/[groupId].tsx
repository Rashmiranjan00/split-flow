import React from 'react';
import styled from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
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
import {
  MOCK_GROUPS,
  MOCK_EXPENSES,
  MOCK_MEMBERS,
  getGroupBalance,
  getGroupMemberBalances,
} from '@/shared/data/mockData';

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
  background-color: ${Colors.primaryContainer};
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
}

const BalanceCardStyled = styled.View<PositiveProps>`
  background-color: ${(props: PositiveProps) =>
    props.positive ? 'rgba(60,221,199,0.1)' : 'rgba(255,180,171,0.1)'};
  border-width: 1px;
  border-color: ${(props: PositiveProps) =>
    props.positive ? Colors.tertiary : Colors.error};
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
  border-bottom-color: ${Colors.outlineVariant};
  margin-bottom: 0;
`;

const MemberBalance = styled(BodySm)<PositiveProps>`
  color: ${(props: PositiveProps) => props.positive ? Colors.tertiary : Colors.error};
  font-weight: 600;
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

const GroupDetailScreen = () => {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { userId } = useUser();
  const { formatDate } = useDateFormatter();
  const router = useRouter();

  const group = React.useMemo(() => MOCK_GROUPS.find(g => g.id === groupId), [groupId]);
  
  if (!group) return null;

  const balance = getGroupBalance(groupId!, userId);
  const isPositive = balance >= 0;
  const memberBalances = getGroupMemberBalances(groupId!, userId);
  const groupExpenses = React.useMemo(() => 
    MOCK_EXPENSES
      .filter(e => e.groupId === groupId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [groupId]
  );

  const getGroupEmoji = (name: string) => {
    if (name.includes('🏖')) return '🏖';
    if (name.includes('🏠')) return '🏠';
    if (name.includes('🍽')) return '🍽';
    return '💼';
  };

  return (
    <Screen>
      <Header>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </BackBtn>
        <Title numberOfLines={1} style={{ flex: 1 }}>
          {group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}
        </Title>
      </Header>

      <Content showsVerticalScrollIndicator={false}>
        <HeroBanner>
          <GroupEmojiLarge>{getGroupEmoji(group.name)}</GroupEmojiLarge>
          <Headline style={{ color: Colors.primary }}>
            {group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}
          </Headline>
          <BodySm style={{ color: Colors.primary, opacity: 0.7 }}>
            {group.description}
          </BodySm>
        </HeroBanner>

        <BalanceBanner>
          <BalanceCardStyled positive={isPositive}>
            <Label style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {isPositive ? 'You are owed' : 'You owe in total'}
            </Label>
            <Display positive={isPositive} style={{ color: isPositive ? Colors.tertiary : Colors.error }}>
              {isPositive ? '+' : '-'}${Math.abs(balance).toFixed(2)}
            </Display>
          </BalanceCardStyled>
        </BalanceBanner>

        <SectionPad>
          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Balances
          </Label>
          {memberBalances.length === 0 ? (
            <BodySm style={{ color: Colors.tertiary, paddingVertical: Spacing.sm, fontWeight: '600' }}>
              ✓ All settled up!
            </BodySm>
          ) : (
            memberBalances.map(mb => (
              <MemberRow key={mb.userId}>
                <Row style={{ marginBottom: 0 }}>
                  <Avatar name={mb.name} size={40} />
                  <Spacer size="md" horizontal />
                  <BodyMd style={{ fontWeight: '500' }}>{mb.name}</BodyMd>
                </Row>
                <MemberBalance positive={mb.amount > 0}>
                  {mb.amount > 0 ? `owes you $${mb.amount.toFixed(2)}` : `you owe $${Math.abs(mb.amount).toFixed(2)}`}
                </MemberBalance>
              </MemberRow>
            ))
          )}

          <Spacer size="lg" />

          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Members ({group.members.length})
          </Label>
          {group.members.map(mid => {
            const member = MOCK_MEMBERS.find(m => m.id === mid);
            return (
              <MemberRow key={mid}>
                <Row style={{ marginBottom: 0 }}>
                  <Avatar name={member?.name ?? 'User'} size={40} />
                  <Spacer size="md" horizontal />
                  <BodyMd style={{ fontWeight: '500' }}>{member?.name ?? mid}</BodyMd>
                  {mid === userId && (
                    <>
                      <Spacer size="xs" horizontal />
                      <MaterialIcons name="star" size={16} color={Colors.primary} />
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
            const payer = MOCK_MEMBERS.find(m => m.id === expense.payerId);
            return (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                subtitle={`${expense.payerId === userId ? 'You' : payer?.name} paid · ${formatDate(expense.date)}`}
                amount={expense.amount}
                date={formatDate(expense.date)}
                onPress={() => {}}
              />
            );
          })}
        </SectionPad>

        <AddExpenseBtn onPress={() => router.push('/expense/add')} activeOpacity={0.8}>
          <MaterialIcons name="add" size={20} color={Colors.primary} />
          <BodyMd style={{ color: Colors.primary, fontWeight: '600' }}>Add Expense</BodyMd>
        </AddExpenseBtn>

        <Spacer size="xxl" />
      </Content>
    </Screen>
  );
};

export default GroupDetailScreen;
