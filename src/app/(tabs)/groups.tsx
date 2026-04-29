import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Users as UsersIcon, UserPlus } from 'lucide-react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { Screen, Content, SpaceBetweenRow, Spacer } from '@/shared/components/Layout';
import { BodyMd, Title } from '@/shared/components/Typography';
import { GroupCard } from '@/features/groups/components/GroupCard';
import { useUser } from '@/shared/hooks/useUser';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useGroupBalances } from '@/features/balances/hooks/useGroupBalances';
import { LoadingView } from '@/shared/components/LoadingView';
import { ActionButton } from '@/shared/components/ActionButton';

const HeaderRow = styled(SpaceBetweenRow)`
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

const AddButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.divider};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${Spacing.xxxl}px ${Spacing.screenPadding}px;
`;

const EmptyIconWrap = styled.View`
  margin-bottom: ${Spacing.md}px;
`;

/** Renders a single group card with its balance. Extracted so each card
 *  can independently subscribe to its group's expense/settlement queries. */
const GroupCardWithBalance: React.FC<{
  group: ReturnType<typeof useGroups>['groups'][number];
  friends: ReturnType<typeof useFriends>['friends'];
  userId: string;
  isLast: boolean;
  onPress: () => void;
}> = ({ group, friends, userId, isLast, onPress }) => {
  const { netPositions } = useGroupBalances(group.id);
  const balance = netPositions[userId] || 0;

  const groupMembers = group.members.map(
    (mid) => friends.find((f) => f.id === mid) || { id: mid, name: 'User' }
  );

  return (
    <GroupCard
      group={group}
      balance={balance}
      members={groupMembers}
      isLast={isLast}
      onPress={onPress}
    />
  );
};

const GroupsScreen = () => {
  const { userId } = useUser();
  const { groups, isLoading } = useGroups();
  const { friends } = useFriends();
  const router = useRouter();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Screen>
        <LoadingView message="Loading groups..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderRow>
          <ScreenTitle>Groups</ScreenTitle>
          <AddButton onPress={() => router.push('/group/create' as any)} activeOpacity={0.7}>
            <Plus size={20} color={theme.colors.primary} />
          </AddButton>
        </HeaderRow>

        {groups.length === 0 ? (
          <EmptyState>
            <EmptyIconWrap>
              <UsersIcon size={40} color={theme.colors.onSurfaceVariant} />
            </EmptyIconWrap>
            {friends.length === 0 ? (
              <>
                <Title>Add friends first</Title>
                <Spacer size="sm" />
                <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  You need friends before you can create a group.
                </BodyMd>
                <Spacer size="md" />
                <ActionButton
                  title="Add Friends"
                  icon={UserPlus}
                  onPress={() => router.push('/friend-requests/search' as any)}
                />
              </>
            ) : (
              <>
                <Title>No groups yet</Title>
                <Spacer size="sm" />
                <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                  Create a group to start splitting expenses with friends.
                </BodyMd>
                <Spacer size="md" />
                <ActionButton
                  title="Create Group"
                  icon={Plus}
                  onPress={() => router.push('/group/create' as any)}
                />
              </>
            )}
          </EmptyState>
        ) : (
          groups.map((group, idx) => (
            <GroupCardWithBalance
              key={group.id}
              group={group}
              friends={friends}
              userId={userId}
              isLast={idx === groups.length - 1}
              onPress={() => router.push(`/group/${group.id}` as any)}
            />
          ))
        )}

        <View style={{ height: Spacing.xxxl }} />
      </Content>
    </Screen>
  );
};

export default GroupsScreen;
