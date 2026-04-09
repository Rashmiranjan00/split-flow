import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { Spacing } from '@/shared/constants/spacing';
import { 
  Screen, 
  Content, 
  SpaceBetweenRow, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Headline,
  Title, 
  BodyMd,
  Label
} from '@/shared/components/Typography';
import { ActivityItem } from '@/features/activity/components/ActivityItem';
import { useUser } from '@/shared/hooks/useUser';
import { MOCK_EXPENSES, GROUP_MAP, MOCK_MEMBERS } from '@/shared/data/mockData';
import { ExpenseSplit } from '@/shared/types';

interface ActivityItemData {
  id: string;
  type: 'EXPENSE' | 'SETTLEMENT' | 'SYSTEM';
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
}

const DateGroup = styled(Label)`
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.primary};
`;

const ActivityScreen = () => {
  const { userId } = useUser();

  const activityData = React.useMemo(() => {
    // Transform expenses into activity items
    const items: ActivityItemData[] = MOCK_EXPENSES.map(expense => {
      const payer = MOCK_MEMBERS.find(m => m.id === expense.payerId);
      const payerName = payer?.id === userId ? 'You' : payer?.name ?? 'Someone';
      const groupName = GROUP_MAP.get(expense.groupId)?.name ?? 'Group';
      
      const mySplit = expense.splits.find((s: ExpenseSplit) => s.userId === userId);
      const myValue = mySplit?.value ?? 0;
      
      let title = '';
      let subtitle = '';
      let amount = 0;

      if (expense.payerId === userId) {
        title = `You paid for "${expense.title}"`;
        subtitle = `In ${groupName}`;
        amount = expense.amount - myValue; // What others owe you
      } else {
        title = `${payerName} paid for "${expense.title}"`;
        subtitle = `In ${groupName}`;
        amount = -myValue; // What you owe
      }

      return {
        id: expense.id,
        type: 'EXPENSE',
        title,
        subtitle,
        amount,
        date: expense.date,
      };
    });

    // Group by date
    const groups: { [date: string]: ActivityItemData[] } = {};
    items.forEach(item => {
      const date = new Date(item.date).toLocaleDateString(undefined, { 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });

    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }, [userId]);

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SpaceBetweenRow style={{ marginTop: Spacing.md, marginBottom: Spacing.lg }}>
            <Headline>Activity</Headline>
          </SpaceBetweenRow>

          {activityData.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <BodyMd style={{ opacity: 0.6 }}>No activity yet.</BodyMd>
            </View>
          ) : (
            activityData.map(group => (
              <View key={group.date}>
                <DateGroup>{group.date}</DateGroup>
                {group.data.map(item => (
                  <ActivityItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    amount={item.amount}
                    type={item.type}
                    payerName="" // Not needed for the component display logic we have now
                    date={new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    onPress={() => {}}
                  />
                ))}
              </View>
            ))
          )}
          <Spacer size="xxxl" />
        </View>
      </Content>
    </Screen>
  );
};

export default ActivityScreen;
