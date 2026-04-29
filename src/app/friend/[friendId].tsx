import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Content, Row, Spacer } from '@/shared/components/Layout';
import { RowSubtitle } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { ScreenTabs } from '@/shared/components/ScreenTabs';
import { ActivityItem } from '@/features/activity/components/ActivityItem';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useRemoveFriendMutation } from '@/features/friends/hooks/useFriendMutations';
import { useFriendAnalytics } from '@/features/analytics/hooks/useFriendAnalytics';
import { StatCard } from '@/features/analytics/components/StatCard';
import { ChartCard } from '@/features/analytics/components/ChartCard';
import { CategoryPieChart } from '@/features/analytics/components/CategoryPieChart';
import {
  ContributionBarChart,
  type ContributionBar,
} from '@/features/analytics/components/ContributionBarChart';
import { SpendOverTimeChart } from '@/features/analytics/components/SpendOverTimeChart';
import { InsightsEmptyState } from '@/features/analytics/components/InsightsEmptyState';
import { LoadingView } from '@/shared/components/LoadingView';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const IconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const HeaderTitleRow = styled.View`
  flex: 1;
  align-items: center;
`;

const HeaderTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const HeroSection = styled.View`
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.lg}px;
`;

const FriendName = styled.Text`
  margin-top: ${Spacing.sm}px;
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 20px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.3px;
`;

const FriendEmail = styled.Text`
  margin-top: 4px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin: 0 ${Spacing.screenPadding}px;
`;

const BottomCTA = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.xl}px;
`;

const TabContent = styled.View`
  padding: 0 ${Spacing.screenPadding}px;
`;

const InsightsStack = styled.View`
  padding: 0 ${Spacing.screenPadding}px;
  gap: ${Spacing.md}px;
`;

const HeroStatsRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.md}px;
  padding: 0 ${Spacing.screenPadding}px;
  margin-bottom: ${Spacing.md}px;
`;

type FriendTabId = 'transactions' | 'insights';

const TAB_ITEMS = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'insights', label: 'Insights' },
];

const FriendDetailScreen = () => {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const fid = friendId ?? '';
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<FriendTabId>('transactions');

  const { friends, isLoading: friendsLoading } = useFriends();
  const friend = friends.find((f) => f.id === fid);
  const analytics = useFriendAnalytics(fid);
  const removeFriendMutation = useRemoveFriendMutation();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();

  if (friendsLoading || analytics.isLoading) {
    return (
      <SafeScreen>
        <LoadingView message="Loading friend details..." />
      </SafeScreen>
    );
  }

  if (!friend) {
    return (
      <SafeScreen>
        <HeaderBar>
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.onSurface} />
          </IconButton>
          <HeaderTitleRow>
            <HeaderTitle>Friend</HeaderTitle>
          </HeaderTitleRow>
          <View style={{ width: 36, height: 36 }} />
        </HeaderBar>
        <View style={{ padding: Spacing.screenPadding }}>
          <RowSubtitle>This friend is no longer on your list.</RowSubtitle>
        </View>
      </SafeScreen>
    );
  }

  const netBalance = analytics.netBalance;
  const tone: 'positive' | 'negative' | 'neutral' =
    netBalance > 0 ? 'positive' : netBalance < 0 ? 'negative' : 'neutral';
  const netCaption =
    netBalance > 0
      ? `${friend.name} owes you`
      : netBalance < 0
        ? `You owe ${friend.name}`
        : 'All settled up';

  const contributionData: ContributionBar[] = [
    { id: 'me', label: 'You', amount: analytics.whoPaidMore.me },
    {
      id: 'friend',
      label: friend.name.length > 10 ? `${friend.name.slice(0, 9)}…` : friend.name,
      amount: analytics.whoPaidMore.friend,
    },
  ];

  const payerLeader =
    analytics.whoPaidMore.me === 0 && analytics.whoPaidMore.friend === 0
      ? null
      : analytics.whoPaidMore.me >= analytics.whoPaidMore.friend
        ? 'You'
        : friend.name;

  const handleRemove = () => {
    Alert.alert('Remove friend', `Remove ${friend.name} from your friends list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeFriendMutation.mutate(friend.id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
  };

  const renderTransactionsTab = () => {
    if (analytics.transactions.length === 0) {
      return (
        <TabContent style={{ paddingVertical: Spacing.md }}>
          <InsightsEmptyState
            title="No transactions yet"
            message={`Add an expense with ${friend.name} to see it here`}
          />
        </TabContent>
      );
    }
    return (
      <View>
        {analytics.transactions.map((txn, idx) => (
          <ActivityItem
            key={txn.id}
            type={txn.type}
            title={txn.title}
            subtitle={txn.subtitle}
            amount={txn.amount}
            payerName=""
            date={formatDate(txn.date)}
            isLast={idx === analytics.transactions.length - 1}
            onPress={() => {
              router.push(`/group/${txn.groupId}` as any);
            }}
          />
        ))}
      </View>
    );
  };

  const renderInsightsTab = () => {
    if (analytics.isEmpty) {
      return (
        <TabContent>
          <InsightsEmptyState
            title="No insights yet"
            message={`Add an expense with ${friend.name} to see insights`}
          />
        </TabContent>
      );
    }
    return (
      <InsightsStack>
        <Row style={{ gap: Spacing.md, marginBottom: 0 }}>
          <StatCard
            label="You paid"
            value={formatCurrency(analytics.whoPaidMore.me, { decimals: 0 })}
            tone={analytics.whoPaidMore.me >= analytics.whoPaidMore.friend ? 'positive' : 'neutral'}
          />
          <StatCard
            label={`${friend.name.split(' ')[0]} paid`}
            value={formatCurrency(analytics.whoPaidMore.friend, { decimals: 0 })}
            tone={analytics.whoPaidMore.friend > analytics.whoPaidMore.me ? 'positive' : 'neutral'}
          />
        </Row>

        {payerLeader ? (
          <ChartCard title="Who paid more" subtitle={`${payerLeader} covered the larger share.`}>
            <ContributionBarChart data={contributionData} />
          </ChartCard>
        ) : null}

        <ChartCard title="Spending by category">
          {analytics.categoryBreakdown.length === 0 ? (
            <InsightsEmptyState
              compact
              title="No category data"
              message="Tag shared expenses to see a breakdown"
            />
          ) : (
            <CategoryPieChart data={analytics.categoryBreakdown} />
          )}
        </ChartCard>

        <ChartCard title="Spend over time">
          {analytics.spendOverTime.length < 2 ? (
            <InsightsEmptyState
              compact
              title="Not enough timeline data"
              message="Add more shared expenses to chart a trend"
            />
          ) : (
            <SpendOverTimeChart data={analytics.spendOverTime} />
          )}
        </ChartCard>
        <Spacer size="md" />
      </InsightsStack>
    );
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitleRow>
          <HeaderTitle numberOfLines={1}>{friend.name}</HeaderTitle>
        </HeaderTitleRow>
        <IconButton
          onPress={handleRemove}
          accessibilityRole="button"
          accessibilityLabel="Remove friend">
          <MoreVertical size={22} color={theme.colors.onSurface} />
        </IconButton>
      </HeaderBar>

      <Content showsVerticalScrollIndicator={false}>
        <HeroSection>
          <Avatar name={friend.name} imageUrl={friend.avatarUrl} size={Spacing.avatarLg} />
          <FriendName>{friend.name}</FriendName>
          <FriendEmail>{friend.email}</FriendEmail>
        </HeroSection>

        <HeroStatsRow>
          <StatCard
            label="Net balance"
            value={formatCurrency(Math.abs(netBalance), { decimals: 0 })}
            tone={tone}
            caption={netCaption}
          />
          <StatCard
            label="Spent together"
            value={formatCurrency(analytics.totalSpentTogether, { decimals: 0 })}
            caption={`${analytics.sharedExpenses.length} shared expense${
              analytics.sharedExpenses.length === 1 ? '' : 's'
            }`}
          />
        </HeroStatsRow>

        <Divider />

        <ScreenTabs
          tabs={TAB_ITEMS}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as FriendTabId)}
        />

        {activeTab === 'transactions' ? renderTransactionsTab() : null}
        {activeTab === 'insights' ? renderInsightsTab() : null}

        <Spacer size="xl" />
      </Content>

      <BottomCTA>
        <ActionButton
          title="Settle up"
          onPress={() => router.push(`/settle/${friend.id}` as any)}
        />
      </BottomCTA>
    </SafeScreen>
  );
};

export default FriendDetailScreen;
