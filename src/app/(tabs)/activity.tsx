import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { MOCK_EXPENSES, MOCK_GROUPS, MOCK_MEMBERS } from '@/data/mockData';

interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number | null;
  date: string;
  timestamp: number;
  type: 'expense' | 'settlement' | 'group_join';
}

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${Spacing.lg}px;
`;

const HeaderTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
  letter-spacing: -1.5px;
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const DateGroup = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.sm}px;
`;

const ActivityRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${Spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
  opacity: 0.95;
`;

const IconCircle = styled.View<{ type: string }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({ type }: { type: string }) => {
    if (type === 'settlement') return 'rgba(60, 221, 199, 0.15)';
    if (type === 'group_join') return 'rgba(149, 211, 186, 0.15)';
    return Colors.surfaceContainerHigh;
  }};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const IconEmoji = styled.Text`
  font-size: 20px;
`;

const ActivityInfo = styled.View`
  flex: 1;
`;

const ActivityTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const ActivitySubtitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-top: 2px;
`;

const AmountText = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean }) => positive ? Colors.tertiary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

function groupByDate(items: ActivityItem[]): { date: string; items: ActivityItem[] }[] {
  const groups: Record<string, ActivityItem[]> = {};
  const now = new Date();

  items.forEach(item => {
    const date = new Date(item.date);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    let label: string;
    if (diffDays === 0) label = 'Today';
    else if (diffDays === 1) label = 'Yesterday';
    else if (diffDays < 7) label = `${diffDays} days ago`;
    else label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });

  return Object.entries(groups).map(([date, items]) => ({ date, items }));
}

export default function ActivityScreen() {
  const router = useRouter();

  // Build activity feed from mock expenses
  const activities: ActivityItem[] = MOCK_EXPENSES
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(expense => {
      const myShare = expense.splits.find(s => s.userId === 'usr_1')?.value ?? 0;
      const iAmPayer = expense.payerId === 'usr_1';
      const amount = iAmPayer ? expense.amount - myShare : -myShare;
      const group = MOCK_GROUPS.find(g => g.id === expense.groupId);
      const payer = MOCK_MEMBERS.find(m => m.id === expense.payerId);

      return {
        id: expense.id,
        title: expense.title,
        subtitle: iAmPayer
          ? `You paid · ${group?.name ?? ''}`
          : `${payer?.name ?? 'Someone'} paid · ${group?.name ?? ''}`,
        amount,
        date: expense.date,
        timestamp: new Date(expense.date).getTime(),
        type: 'expense' as const,
      };
    });

  // Add mock settlement entries
  const settleActivities: ActivityItem[] = [
    {
      id: 'settle_1',
      title: 'Sarah settled up',
      subtitle: 'Paid you for Summer Trip',
      amount: 40,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      type: 'settlement',
    },
  ];

  const allActivities = [...activities, ...settleActivities].sort((a, b) => b.timestamp - a.timestamp);
  const grouped = groupByDate(allActivities);

  const getIcon = (type: string, title: string) => {
    if (type === 'settlement') return '✅';
    if (type === 'group_join') return '👥';
    if (title.toLowerCase().includes('dinner') || title.toLowerCase().includes('restaurant')) return '🍽';
    if (title.toLowerCase().includes('uber') || title.toLowerCase().includes('transport')) return '🚗';
    if (title.toLowerCase().includes('villa') || title.toLowerCase().includes('rent') || title.toLowerCase().includes('booking')) return '🏠';
    if (title.toLowerCase().includes('electric') || title.toLowerCase().includes('bill')) return '⚡';
    if (title.toLowerCase().includes('wine') || title.toLowerCase().includes('drinks')) return '🍷';
    return '💳';
  };

  return (
    <Container edges={['top']}>
      <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <HeaderTitle>Activity</HeaderTitle>

        {grouped.map(({ date, items }) => (
          <React.Fragment key={date}>
            <DateGroup>{date}</DateGroup>
            {items.map(item => (
              <ActivityRow key={item.id} onPress={() => {}} activeOpacity={0.7}>
                <IconCircle type={item.type}>
                  <IconEmoji>{getIcon(item.type, item.title)}</IconEmoji>
                </IconCircle>
                <ActivityInfo>
                  <ActivityTitle>{item.title}</ActivityTitle>
                  <ActivitySubtitle>{item.subtitle}</ActivitySubtitle>
                </ActivityInfo>
                {item.amount !== null && (
                  <AmountText positive={item.amount >= 0}>
                    {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                  </AmountText>
                )}
              </ActivityRow>
            ))}
          </React.Fragment>
        ))}
      </Content>
    </Container>
  );
}
