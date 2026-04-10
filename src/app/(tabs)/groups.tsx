import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
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
  BodyMd 
} from '@/shared/components/Typography';
import { GroupCard } from '@/features/groups/components/GroupCard';
import { useUser } from '@/shared/hooks/useUser';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useGroupStore } from '@/features/groups/store';
import { useExpenseStore } from '@/features/expenses/store';
import { useSettlementStore } from '@/features/settlements/store';
import { calculateGroupBalances } from '@/shared/utils/balanceEngine';

const HeaderRow = styled(SpaceBetweenRow)`
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const AddButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.View`
  align-items: center;
  padding-vertical: ${Spacing.xxxl}px;
`;

const EmptyEmoji = styled.Text`
  font-size: 48px;
  margin-bottom: ${Spacing.md}px;
`;

const GroupsScreen = () => {
  const { userId } = useUser();
  const { groups } = useGroups();
  const { friends } = useFriends();
  const expenses = useExpenseStore(s => s.expenses);
  const settlements = useSettlementStore(s => s.settlements);
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <HeaderRow>
            <Headline>Vaults</Headline>
            <AddButton
              onPress={() => Alert.alert('New Group', 'Create group coming soon!')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="add" size={22} color={theme.colors.primary} />
            </AddButton>
          </HeaderRow>

          {groups.length === 0 ? (
            <EmptyState>
              <EmptyEmoji>🏛</EmptyEmoji>
              <Title>No vaults yet</Title>
              <BodyMd style={{ textAlign: 'center' }}>
                Create a group to start splitting expenses with friends.
              </BodyMd>
            </EmptyState>
          ) : (
            groups.map(group => {
              const groupExpenses = expenses.filter(e => e.groupId === group.id);
              const groupSettlements = settlements.filter(s => s.groupId === group.id);
              const { netPositions } = calculateGroupBalances(groupExpenses, groupSettlements);
              const balance = netPositions[userId] || 0;
              
              const groupMembers = group.members.map(mid => 
                friends.find(f => f.id === mid) || { id: mid, name: 'User' }
              );

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  balance={balance}
                  members={groupMembers}
                  onPress={() => router.push(`/group/${group.id}` as any)}
                />
              );
            })
          )}
          <Spacer size="xl" />
        </View>
      </Content>
    </Screen>
  );
};

export default GroupsScreen;
