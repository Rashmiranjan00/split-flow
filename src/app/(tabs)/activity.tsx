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
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';

// ActivityItemData is now imported from '@/features/activity/hooks/useActivity'

const DateGroup = styled(Label)`
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.primary};
`;

const ActivityScreen = () => {
  const { userId } = useUser();
  const { activity } = useActivity();
  const { formatDate } = useDateFormatter();

  const groupedActivity = React.useMemo(() => {
    const groups: { [date: string]: any[] } = {};
    
    activity.forEach(item => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, { 
        month: 'long', 
        day: 'numeric' 
      });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });

    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }, [activity]);


  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SpaceBetweenRow style={{ marginTop: Spacing.md, marginBottom: Spacing.lg }}>
            <Headline>Activity</Headline>
          </SpaceBetweenRow>

          {groupedActivity.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <BodyMd style={{ opacity: 0.6 }}>No activity yet.</BodyMd>
            </View>
          ) : (
            groupedActivity.map(group => (
              <View key={group.date}>
                <DateGroup>{group.date}</DateGroup>
                {group.data.map(item => (
                  <ActivityItem
                    key={item.id}
                    title={item.title}
                    subtitle={item.subtitle}
                    amount={item.amount}
                    type={item.type}
                    payerName="" 
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
