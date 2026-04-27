import React from 'react';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';
import { ActionButton } from '@/shared/components/ActionButton';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Spacer } from '@/shared/components/Layout';

const HeroSection = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
`;

const LogoCircle = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-bottom: ${Spacing.xl}px;
`;

const LogoLetter = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onPrimary};
`;

const Wordmark = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 32px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.8px;
`;

const Tagline = styled.Text`
  margin-top: ${Spacing.md}px;
  text-align: center;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  line-height: 22px;
  padding-horizontal: ${Spacing.lg}px;
`;

const AuthActions = styled.View`
  padding: ${Spacing.screenPadding}px;
  padding-bottom: ${Spacing.xxl}px;
  gap: ${Spacing.md}px;
`;

const AuthScreen = () => {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    login({ id: 'usr_1', name: 'Rashmi Ranjan', email: 'rashmi@example.com' });
    router.replace('/(tabs)' as any);
  };

  return (
    <SafeScreen>
      <HeroSection>
        <LogoCircle>
          <LogoLetter>S</LogoLetter>
        </LogoCircle>
        <Wordmark>SplitFlow</Wordmark>
        <Tagline>
          Split bills, share expenses, and manage group finances with ease.
        </Tagline>
      </HeroSection>

      <AuthActions>
        <ActionButton title="Get Started" onPress={handleLogin} />
        <ActionButton title="Log In" variant="outline" onPress={handleLogin} />
      </AuthActions>
    </SafeScreen>
  );
};

export default AuthScreen;
