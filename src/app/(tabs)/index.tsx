import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useActivity } from '@/features/activity/hooks/useActivity';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const HeaderSection = styled.View`
  padding: ${Spacing.xl}px ${Spacing.lg}px ${Spacing.xxl}px;
`;

const HeroName = styled(Display)`
  font-size: 48px;
  line-height: 52px;
  margin-top: ${Spacing.sm}px;
`;

const GreetingGroup = styled.View`
  align-self: flex-end;
  margin-right: ${Spacing.md}px;
  margin-top: -${Spacing.md}px;
`;

const MainContentArea = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  min-height: 600px;
  padding: ${Spacing.lg}px;
`;

const ActivityHeader = styled(SpaceBetweenRow)`
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
`;

const SeeAllText = styled.TouchableOpacity``;

const SeeAllLabel = styled(BodySm)`
  color: ${({ theme }) => theme.colors.primary};
`;

const GroupChipsRow = styled.ScrollView`
  margin-bottom: ${Spacing.md}px;
`;

interface ActiveProps {
  active?: boolean;
}

const GroupChip = styled.TouchableOpacity<ActiveProps>`
  background-color: ${({ active, theme }: ActiveProps & { theme: any }) =>
    active ? theme.colors.primaryContainer : theme.colors.surfaceContainerLow};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.md}px;
  padding-vertical: ${Spacing.xs}px;
  margin-right: ${Spacing.sm}px;
  border-width: 1px;
  border-color: ${({ active, theme }: ActiveProps & { theme: any }) =>
    active ? theme.colors.primary : theme.colors.outlineVariant};
`;

const GroupChipText = styled(BodySm)<ActiveProps>`
  color: ${({ active, theme }: ActiveProps & { theme: any }) =>
    active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-weight: ${({ active }: ActiveProps) => active ? '600' : '400'};
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${Spacing.xxl}px;
`;

const FABWrapper = styled.View`
  position: absolute;
  bottom: 110px; /* Elevated for the floating tab bar */
  right: ${Spacing.lg}px;
`;

const FABButton = styled.TouchableOpacity`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  shadow-color: ${({ theme }) => theme.colors.primary};
  shadow-offset: 0px 8px;
  shadow-opacity: 0.3;
  shadow-radius: 12px;
  elevation: 6;
`;

const HomeScreen = () => {
  const { user } = useUser();
  const { netBalance, totalOwedToYou, totalYouOwe } = useBalances();
  const { recent: recentActivities, isEmpty: activityEmpty } = useActivity();
  const { groups } = useGroups();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useCurrencyFormatter();
  const router = useRouter();
  const theme = useTheme();
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  const filteredActivities = React.useMemo(() => {
    if (!activeGroup) return recentActivities;
    return recentActivities.filter(a => a.groupId === activeGroup);
  }, [recentActivities, activeGroup]);

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderSection>
          <SpaceBetweenRow>
            <Label>Dashboard</Label>
            <Avatar 
              name={user?.name ?? 'User'} 
              size={40} 
              borderWidth={0} 
            />
          </SpaceBetweenRow>
          
          <HeroName>
            {user?.name?.split(' ')[0] ?? 'User'}
          </HeroName>
          
          <GreetingGroup>
            <BodySm style={{ opacity: 0.7 }}>
              {new Date().getHours() < 12 ? 'Good morning' : 'Good evening'}
            </BodySm>
          </GreetingGroup>
        </HeaderSection>

        <MainContentArea>
          <BalanceCard totalBalance={netBalance} />

          <Row style={{ gap: Spacing.md, marginTop: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Label>Owed to you</Label>
              <Title style={{ color: theme.colors.tertiary }}>{formatCurrency(totalOwedToYou)}</Title>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Label>You owe</Label>
              <Title style={{ color: theme.colors.error }}>{formatCurrency(totalYouOwe)}</Title>
            </View>
          </Row>

          <ActivityHeader>
            <Headline style={{ fontSize: 24 }}>Recent Flows</Headline>
            <SeeAllText onPress={() => router.push('/(tabs)/activity')}>
              <SeeAllLabel>Discover all</SeeAllLabel>
            </SeeAllText>
          </ActivityHeader>

          <GroupChipsRow
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Spacing.sm }}
          >
            <GroupChip active={activeGroup === null} onPress={() => setActiveGroup(null)}>
              <GroupChipText active={activeGroup === null}>Overview</GroupChipText>
            </GroupChip>
            {groups.map(group => (
              <GroupChip
                key={group.id}
                active={activeGroup === group.id}
                onPress={() => setActiveGroup(activeGroup === group.id ? null : group.id)}
              >
                <GroupChipText active={activeGroup === group.id}>{group.name}</GroupChipText>
              </GroupChip>
            ))}
          </GroupChipsRow>

          <Spacer size="xs" />

          {filteredActivities.length === 0 ? (
            <EmptyState>
              <BodySm style={{ textAlign: 'center', opacity: 0.6 }}>
                Your financial feed is quiet.{"\n"}Start a new split to see activity.
              </BodySm>
            </EmptyState>
          ) : (
            filteredActivities.map(activity => {
              return (
                <ExpenseCard
                  key={activity.id}
                  title={activity.title}
                  subtitle={activity.subtitle}
                  amount={activity.amount}
                  date={formatDate(activity.date)}
                  highlighted={activity.amount > 0}
                  onPress={() => {}}
                />
              );
            })
          )}

          <Spacer size="xxxl" />
          <Spacer size="xxxl" />
        </MainContentArea>
      </Content>

      <FABWrapper>
        <FABButton onPress={() => router.push('/expense/add')} activeOpacity={0.85}>
          <MaterialIcons name="add" size={32} color={theme.colors.onPrimaryFixed} />
        </FABButton>
      </FABWrapper>
    </Screen>
  );
};

export default HomeScreen;
