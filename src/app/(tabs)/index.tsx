import React from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
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
  BodySm, 
  Label 
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { BalanceCard } from '@/shared/components/BalanceCard';
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard';
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { 
  MOCK_EXPENSES, 
  MOCK_GROUPS, 
  GROUP_MAP,
} from '@/shared/data/mockData';
import { ExpenseSplit } from '@/shared/types';

const HeaderRow = styled(SpaceBetweenRow)`
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const SectionHeader = styled(SpaceBetweenRow)`
  margin-top: ${Spacing.xl}px;
  margin-bottom: ${Spacing.md}px;
`;

const SeeAllText = styled.TouchableOpacity``;

const SeeAllLabel = styled(BodySm)`
  color: ${Colors.primary};
`;

const GroupChipsRow = styled.ScrollView`
  margin-bottom: ${Spacing.md}px;
`;

interface ActiveProps {
  active?: boolean;
}

const GroupChip = styled.TouchableOpacity<ActiveProps>`
  background-color: ${(props: ActiveProps) =>
    props.active ? Colors.primaryContainer : Colors.surfaceContainerLow};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.md}px;
  padding-vertical: ${Spacing.xs}px;
  margin-right: ${Spacing.sm}px;
  border-width: 1px;
  border-color: ${(props: ActiveProps) =>
    props.active ? Colors.primary : Colors.outlineVariant};
`;

const GroupChipText = styled(BodySm)<ActiveProps>`
  color: ${(props: ActiveProps) =>
    props.active ? Colors.primary : Colors.onSurfaceVariant};
  font-weight: ${(props: ActiveProps) => props.active ? '600' : '400'};
`;

const FABWrapper = styled.View`
  position: absolute;
  bottom: ${Spacing.xl}px;
  right: ${Spacing.lg}px;
`;

const FABButton = styled.TouchableOpacity`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${Colors.primary};
  align-items: center;
  justify-content: center;
  elevation: 8;
  shadow-color: ${Colors.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.4;
  shadow-radius: 12px;
`;

const FABIcon = styled.Text`
  color: ${Colors.onPrimaryFixed};
  font-size: 28px;
  font-weight: 300;
  margin-top: -2px;
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${Spacing.xxl}px;
`;

const HomeScreen = () => {
  const { user, userId } = useUser();
  const { totalBalance } = useBalances();
  const { formatDate } = useDateFormatter();
  const router = useRouter();
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  const recentExpenses = React.useMemo(() => {
    return [...MOCK_EXPENSES]
      .filter(e => activeGroup ? e.groupId === activeGroup : true)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [activeGroup]);

  const getExpenseAmount = (expenseId: string) => {
    const expense = MOCK_EXPENSES.find(e => e.id === expenseId);
    if (!expense) return 0;
    const myShare = expense.splits.find((s: ExpenseSplit) => s.userId === userId)?.value ?? 0;
    return expense.payerId === userId ? expense.amount - myShare : -myShare;
  };

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.lg }}>
          <HeaderRow>
            <View>
              <BodySm style={{ letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Good morning
              </BodySm>
              <Display style={{ fontSize: 32 }}>
                {user?.name?.split(' ')[0] ?? 'User'} 👋
              </Display>
            </View>
            <Avatar name={user?.name ?? 'User'} size={48} borderWidth={2} borderColor={Colors.primary} />
          </HeaderRow>

          <BalanceCard totalBalance={totalBalance} />

          <SectionHeader>
            <Title>Recent Activity</Title>
            <SeeAllText onPress={() => router.push('/(tabs)/activity')}>
              <SeeAllLabel>See all</SeeAllLabel>
            </SeeAllText>
          </SectionHeader>

          <GroupChipsRow
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: Spacing.lg }}
          >
            <GroupChip active={activeGroup === null} onPress={() => setActiveGroup(null)}>
              <GroupChipText active={activeGroup === null}>All</GroupChipText>
            </GroupChip>
            {MOCK_GROUPS.map(group => (
              <GroupChip
                key={group.id}
                active={activeGroup === group.id}
                onPress={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
              >
                <GroupChipText active={activeGroup === group.id}>{group.name}</GroupChipText>
              </GroupChip>
            ))}
          </GroupChipsRow>

          {recentExpenses.length === 0 ? (
            <EmptyState>
              <BodySm style={{ textAlign: 'center' }}>
                No expenses found.{"\n"}Add your first expense!
              </BodySm>
            </EmptyState>
          ) : (
            recentExpenses.map(expense => {
              const amount = getExpenseAmount(expense.id);
              return (
                <ExpenseCard
                  key={expense.id}
                  title={expense.title}
                  subtitle={
                    expense.payerId === userId
                      ? `You paid · ${GROUP_MAP.get(expense.groupId)?.name}`
                      : `${expense.splitType === 'EQUAL' ? 'Split equally' : 'Custom split'} · ${GROUP_MAP.get(expense.groupId)?.name}`
                  }
                  amount={amount}
                  date={formatDate(expense.date)}
                  highlighted={amount > 0}
                  onPress={() => {}}
                />
              );
            })
          )}

          <Spacer size="xxxl" />
        </View>
      </Content>

      <FABWrapper>
        <FABButton onPress={() => router.push('/expense/add')} activeOpacity={0.85}>
          <FABIcon>+</FABIcon>
        </FABButton>
      </FABWrapper>
    </Screen>
  );
};

export default HomeScreen;
