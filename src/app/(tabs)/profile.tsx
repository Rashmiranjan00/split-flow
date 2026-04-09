import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/features/auth/store';
import { ActionButton } from '@/components/ActionButton';

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

const ProfileCard = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.xl}px;
  align-items: center;
  margin-bottom: ${Spacing.xl}px;
`;

const Name = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
  margin-top: ${Spacing.md}px;
`;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <Container>
      <Content showsVerticalScrollIndicator={false}>
        <Header>Profile</Header>
        <ProfileCard>
          <Name>{user?.name || 'Guest'}</Name>
        </ProfileCard>
        
        <ActionButton title="Logout" variant="secondary" onPress={logout} />
      </Content>
    </Container>
  );
}
