import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/features/auth/store';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseCard } from '@/components/ExpenseCard';
import { ActionButton } from '@/components/ActionButton';
import { MOCK_EXPENSES, MOCK_GROUPS, getTotalBalance, getGroupBalance } from '@/data/mockData';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const Padded = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding-horizontal: ${Spacing.lg}px;
  padding-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const Greeting = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const UserName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.headlineMd}px;
  font-weight: ${Typography.weights.bold};
  margin-top: 2px;
`;

const AvatarCircle = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${Colors.primaryContainer};
  align-items: center;
  justify-content: center;
`;

const AvatarInitial = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-horizontal: ${Spacing.lg}px;
  margin-top: ${Spacing.xl}px;
  margin-bottom: ${Spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const SeeAllText = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
`;

const GroupChipsRow = styled.ScrollView`
  padding-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
`;

const GroupChip = styled.TouchableOpacity<{ active?: boolean }>`
  background-color: ${({ active }: { active?: boolean }) =>
    active ? Colors.primaryContainer : Colors.surfaceContainerLow};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.md}px;
  padding-vertical: ${Spacing.xs}px;
  margin-right: ${Spacing.sm}px;
  border-width: 1px;
  border-color: ${({ active }: { active?: boolean }) =>
    active ? Colors.primary : Colors.outlineVariant};
`;

const GroupChipText = styled.Text<{ active?: boolean }>`
  color: ${({ active }: { active?: boolean }) =>
    active ? Colors.primary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
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

const EmptyText = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  text-align: center;
  margin-top: ${Spacing.md}px;
`;

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  const totalBalance = getTotalBalance('usr_1');

  // Recent expenses — latest 5, optionally filtered by group
  const recentExpenses = MOCK_EXPENSES
    .filter(e => activeGroup ? e.groupId === activeGroup : true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getExpenseAmount = (expenseId: string) => {
    const expense = MOCK_EXPENSES.find(e => e.id === expenseId);
    if (!expense) return 0;
    const myShare = expense.splits.find(s => s.userId === 'usr_1')?.value ?? 0;
    return expense.payerId === 'usr_1' ? expense.amount - myShare : -myShare;
  };

  return (
    <>
      <Container edges={['top']}>
        <Content showsVerticalScrollIndicator={false}>
          <HeaderRow>
            <ScrollView horizontal={false}>
              <Greeting>Good morning</Greeting>
              <UserName>{user?.name?.split(' ')[0] ?? 'User'} 👋</UserName>
            </ScrollView>
            <AvatarCircle>
              <AvatarInitial>{(user?.name?.[0] ?? 'U').toUpperCase()}</AvatarInitial>
            </AvatarCircle>
          </HeaderRow>

          <Padded>
            <BalanceCard totalBalance={totalBalance} />
          </Padded>

          {/* Group Filter Chips */}
          <SectionHeader>
            <SectionTitle>Recent Activity</SectionTitle>
            <SeeAllText onPress={() => router.push('/(tabs)/activity')}>
              See all
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
              <EmptyText>No expenses found.{'\n'}Add your first expense!</EmptyText>
            </EmptyState>
          ) : (
            <Padded>
              {recentExpenses.map(expense => {
                const amount = getExpenseAmount(expense.id);
                return (
                  <ExpenseCard
                    key={expense.id}
                    title={expense.title}
                    subtitle={
                      expense.payerId === 'usr_1'
                        ? `You paid · ${MOCK_GROUPS.find(g => g.id === expense.groupId)?.name}`
                        : `${expense.splitType === 'EQUAL' ? 'Split equally' : 'Custom split'} · ${MOCK_GROUPS.find(g => g.id === expense.groupId)?.name}`
                    }
                    amount={amount}
                    date={formatDate(expense.date)}
                    highlighted={amount > 0}
                    onPress={() => {}}
                  />
                );
              })}
            </Padded>
          )}

          {/* Bottom padding for FAB */}
          <ScrollView style={{ height: 100 }} />
        </Content>
      </Container>
      <FABWrapper>
        <FABButton onPress={() => router.push('/expense/add')} activeOpacity={0.85}>
          <FABIcon>+</FABIcon>
        </FABButton>
      </FABWrapper>
    </>
  );
}
