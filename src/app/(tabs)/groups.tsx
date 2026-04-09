import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { GroupCard } from '@/components/GroupCard';
import { useGroupStore } from '@/features/groups/store';
import { useRouter } from 'expo-router';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  padding: ${Spacing.lg}px;
`;

const Header = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  margin-bottom: ${Spacing.xl}px;
  letter-spacing: -2px;
`;

export default function GroupsScreen() {
  const router = useRouter();
  // Using some mock data since the store is empty right now
  const groups = [
    {
      id: 'g1',
      title: 'Summer Trip 🏖',
      description: '4 members',
      memberAvatars: ['', '', ''], // empty string falls back to gray circles in the stack
      userBalance: -120.50
    },
    {
      id: 'g2',
      title: 'Apartment 🏠',
      description: '3 members',
      memberAvatars: ['', ''],
      userBalance: 45.00
    }
  ];

  return (
    <Container>
      <Content showsVerticalScrollIndicator={false}>
        <Header>Vaults</Header>
        {groups.map(group => (
          <GroupCard 
            key={group.id}
            title={group.title}
            description={group.description}
            memberAvatars={group.memberAvatars}
            userBalance={group.userBalance}
            onPress={() => router.push(`/group/${group.id}`)}
          />
        ))}
      </Content>
    </Container>
  );
}
