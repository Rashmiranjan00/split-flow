import React from 'react';
import { ActivityIndicator } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Typography } from '@/shared/constants/typography';
import { Spacing } from '@/shared/constants/spacing';

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${Spacing.xl}px;
`;

const Message = styled.Text`
  font-family: ${Typography.fonts.medium};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-top: ${Spacing.md}px;
`;

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({ message }) => {
  const theme = useTheme();

  return (
    <Container>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Message>{message}</Message>}
    </Container>
  );
};
