import React from 'react';
import styled from 'styled-components/native';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/colors';
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
import { MOCK_GROUPS, MOCK_MEMBERS, getGroupBalance } from '@/shared/data/mockData';

const HeaderRow = styled(SpaceBetweenRow)`
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const AddButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${Colors.primaryContainer};
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
  const router = useRouter();

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
              <MaterialIcons name="add" size={22} color={Colors.primary} />
            </AddButton>
          </HeaderRow>

          {MOCK_GROUPS.length === 0 ? (
            <EmptyState>
              <EmptyEmoji>🏛</EmptyEmoji>
              <Title>No vaults yet</Title>
              <BodyMd style={{ textAlign: 'center' }}>
                Create a group to start splitting expenses with friends.
              </BodyMd>
            </EmptyState>
          ) : (
            MOCK_GROUPS.map(group => {
              const balance = getGroupBalance(group.id, userId);
              const members = group.members.map(
                mid => MOCK_MEMBERS.find(m => m.id === mid) || { id: mid, name: 'User', email: '' }
              );

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  balance={balance}
                  members={members}
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
