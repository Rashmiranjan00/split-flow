import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useAuthStore } from '@/features/auth/store';
import { ActionButton } from '@/shared/components/ActionButton';
import { Typography } from '@/shared/constants/typography';
import { Spacing } from '@/shared/constants/spacing';
import { SafeScreen, Spacer } from '@/shared/components/Layout';
import { Display, Title, BodyMd } from '@/shared/components/Typography';

const HeroSection = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.lg}px;
`;

const IconContainer = styled.View`
  width: 100px;
  height: 100px;
  border-radius: 50px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  align-items: center;
  justify-content: center;
  margin-bottom: ${Spacing.xl}px;
`;

const WelcomeText = styled(Display)`
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const SubtitleText = styled(BodyMd)`
  text-align: center;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-top: ${Spacing.md}px;
`;

const AuthActions = styled.View`
  flex: 1;
  padding: ${Spacing.lg}px;
  justify-content: flex-end;
  padding-bottom: ${Spacing.xxl}px;
`;

const AuthScreen = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const theme = useTheme();

  const handleLogin = () => {
    login({ id: 'usr_1', name: 'Rashmi Ranjan', email: 'rashmi@example.com' });
    router.replace('/(tabs)');
  };

  return (
    <SafeScreen>
      <HeroSection>
        <IconContainer>
          <MaterialIcons name="account-balance-wallet" size={48} color={theme.colors.primary} />
        </IconContainer>
        <WelcomeText>SplitFlow</WelcomeText>
        <SubtitleText>
          Split bills, share expenses, and manage group finances with ease.
        </SubtitleText>
      </HeroSection>

      <AuthActions>
        <ActionButton 
          title="Get Started" 
          onPress={handleLogin} 
        />
        <Spacer size="md" />
        <ActionButton 
          title="Log In" 
          onPress={handleLogin} 
          variant="outline"
        />
      </AuthActions>
    </SafeScreen>
  );
};

export default AuthScreen;
