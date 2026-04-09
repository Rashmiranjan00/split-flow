import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/features/auth/store';
import { ActionButton } from '@/components/ActionButton';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
  align-items: center;
  justify-content: center;
  padding: ${Spacing.xl}px;
`;

const Title = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  margin-bottom: ${Spacing.md}px;
`;

const Subtitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  margin-bottom: ${Spacing.xxxl}px;
  text-align: center;
`;

const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = () => {
    login({ id: 'usr_1', name: 'Demo User', email: 'demo@splitflow.com' });
    router.replace('/(tabs)');
  };

  return (
    <Container>
      <Title>SplitFlow</Title>
      <Subtitle>The Ethereal Vault for your shared expenses.</Subtitle>
      <View style={{ width: '100%' }}>
        <ActionButton title="Enter the Vault" onPress={handleLogin} />
      </View>
    </Container>
  );
};

export default LoginScreen;
