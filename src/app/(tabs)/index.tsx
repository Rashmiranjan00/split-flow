import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { CheckCircle2, Receipt } from 'lucide-react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  Screen,
  Content,
  SpaceBetweenRow,
  SectionHeader,
  Spacer,
} from '@/shared/components/Layout';
import { BodyMd } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { BalanceCard } from '@/shared/components/BalanceCard';
import { ExpenseCard } from '@/features/expenses/components/ExpenseCard';
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { LoadingView } from '@/shared/components/LoadingView';

const ICON_FOR_ACTIVITY = (type: string) => (type === 'SETTLEMENT' ? CheckCircle2 : Receipt);

const TopBar = styled(SpaceBetweenRow)`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const Wordmark = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.2px;
`;

const BalanceSection = styled.View`
  padding: 0 ${Spacing.screenPadding}px ${Spacing.md}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-horizontal: ${Spacing.screenPadding}px;
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${Spacing.xxl}px ${Spacing.screenPadding}px;
`;

const HomeScreen = () => {
  const { user } = useUser();
  const { netBalance, totalOwedToYou, totalYouOwe, isLoading: balancesLoading } = useBalances();
  const { recent: recentActivities, isLoading: activityLoading } = useActivity();
  const { formatDate } = useDateFormatter();
  const router = useRouter();
  const theme = useTheme();

  if (balancesLoading || activityLoading) {
    return (
      <Screen>
        <LoadingView message="Loading your balances..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <TopBar>
          <Wordmark>SplitFlow</Wordmark>
          <Avatar name={user?.name ?? 'User'} size={Spacing.avatarSm} />
        </TopBar>

        <BalanceSection>
          <BalanceCard
            totalBalance={netBalance}
            totalOwedToYou={totalOwedToYou}
            totalYouOwe={totalYouOwe}
          />
        </BalanceSection>

        <Divider />

        <SectionHeader
          label="Recent"
          action="See all"
          onAction={() => router.push('/(tabs)/activity')}
        />

        {recentActivities.length === 0 ? (
          <EmptyState>
            <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              No expenses yet.{'\n'}Tap the teal + to add your first one.
            </BodyMd>
          </EmptyState>
        ) : (
          recentActivities.map((activity, idx) => (
            <ExpenseCard
              key={activity.id}
              title={activity.title}
              subtitle={activity.subtitle}
              amount={activity.amount}
              date={formatDate(activity.date)}
              icon={ICON_FOR_ACTIVITY(activity.type)}
              highlighted={activity.amount > 0 ? true : activity.amount < 0 ? false : undefined}
              isLast={idx === recentActivities.length - 1}
              onPress={() => {}}
            />
          ))
        )}

        <Spacer size="xxxl" />
        <Spacer size="xxxl" />

        <View style={{ height: Spacing.fabBottom }} />
      </Content>
    </Screen>
  );
};

export default HomeScreen;
