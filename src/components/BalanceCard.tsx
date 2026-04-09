import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

const GradientContainer = styled(LinearGradient)`
  border-radius: ${Radius.xl}px;
  padding: ${Spacing.xxl}px;
  align-items: center;
  justify-content: center;
  margin-vertical: ${Spacing.md}px;
`;

const Label = styled.Text`
  color: ${Colors.onPrimaryContainer};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: ${Spacing.xs}px;
`;

const BalanceAmount = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  letter-spacing: -1px;
`;

interface BalanceCardProps {
  totalBalance: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ totalBalance }) => {
  const isPositive = totalBalance >= 0;

  return (
    <GradientContainer
      colors={[Colors.primaryContainer, Colors.surfaceContainerLowest]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Label>Total Balance</Label>
      <BalanceAmount>
        {isPositive ? '' : '-'}${Math.abs(totalBalance).toFixed(2)}
      </BalanceAmount>
    </GradientContainer>
  );
};
