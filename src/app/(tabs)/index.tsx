import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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

const ICON_FOR_ACTIVITY = (type: string) => (type === 'SETTLEMENT' ? '✓' : '💸');

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

const FABWrapper = styled.View`
  position: absolute;
  bottom: ${Spacing.fabBottom}px;
  right: ${Spacing.fabRight}px;
`;

const FABButton = styled.TouchableOpacity`
  width: ${Spacing.fabSize}px;
  height: ${Spacing.fabSize}px;
  border-radius: ${Spacing.fabSize / 2}px;
  background-color: ${({ theme }) => theme.colors.brandAccent};
  align-items: center;
  justify-content: center;
  shadow-color: ${({ theme }) => theme.colors.brandAccent};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 4;
`;

const HomeScreen = () => {
  const { user } = useUser();
  const { netBalance, totalOwedToYou, totalYouOwe } = useBalances();
  const { recent: recentActivities } = useActivity();
  const { formatDate } = useDateFormatter();
  const router = useRouter();
  const theme = useTheme();

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

      <FABWrapper>
        <FABButton onPress={() => router.push('/expense/add')} activeOpacity={0.85}>
          <MaterialIcons name="add" size={26} color={theme.colors.onPrimary} />
        </FABButton>
      </FABWrapper>
    </Screen>
  );
};

export default HomeScreen;
