import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { Screen, Content, SpaceBetweenRow, Spacer } from '@/shared/components/Layout';
import { BodyMd, Title } from '@/shared/components/Typography';
import { GroupCard } from '@/features/groups/components/GroupCard';
import { useUser } from '@/shared/hooks/useUser';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useGroupBalances } from '@/features/balances/hooks/useGroupBalances';

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

const EmptyEmoji = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 40px;
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
  const { groups } = useGroups();
  const { friends } = useFriends();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderRow>
          <ScreenTitle>Groups</ScreenTitle>
          <AddButton
            onPress={() => router.push('/group/create' as any)}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={20} color={theme.colors.primary} />
          </AddButton>
        </HeaderRow>

        {groups.length === 0 ? (
          <EmptyState>
            <EmptyEmoji>👥</EmptyEmoji>
            <Title>No groups yet</Title>
            <Spacer size="sm" />
            <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              Create a group to start splitting expenses with friends.
            </BodyMd>
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
