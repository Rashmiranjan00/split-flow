import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  Screen,
  Content,
  SectionHeader,
  Spacer,
} from '@/shared/components/Layout';
import { BodyMd } from '@/shared/components/Typography';
import { ActivityItem } from '@/features/activity/components/ActivityItem';
import { useActivity } from '@/features/activity/hooks/useActivity';

const HeaderRow = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px;
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.sm}px;
`;

const ScreenTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ActivityScreen = () => {
  const theme = useTheme();
  const { activity } = useActivity();

  const groupedActivity = React.useMemo(() => {
    const groups: { [date: string]: typeof activity } = {};

    activity.forEach((item) => {
      const dateLabel = new Date(item.date).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
      });
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(item);
    });

    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }, [activity]);

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderRow>
          <ScreenTitle>Activity</ScreenTitle>
        </HeaderRow>

        {groupedActivity.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 80, paddingHorizontal: Spacing.screenPadding }}>
            <BodyMd style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              No activity yet.{'\n'}Add an expense to see it here.
            </BodyMd>
          </View>
        ) : (
          groupedActivity.map((group) => (
            <View key={group.date}>
              <SectionHeader label={group.date} />
              {group.data.map((item, idx) => (
                <ActivityItem
                  key={item.id}
                  type={item.type}
                  title={item.title}
                  subtitle={item.subtitle}
                  amount={item.amount}
                  payerName=""
                  date={new Date(item.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  isLast={idx === group.data.length - 1}
                  onPress={() => {}}
                />
              ))}
            </View>
          ))
        )}

        <Spacer size="xxxl" />
      </Content>
    </Screen>
  );
};

export default ActivityScreen;
