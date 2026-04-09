import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography } from '@/shared/constants/typography';
import { Label, Display } from '@/shared/components/Typography';

interface BalanceCardProps {
  totalBalance: number;
}

const CardContainer = styled.View`
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  margin-vertical: ${Spacing.lg}px;
  overflow: hidden;
  border-width: 0.5px;
  borderColor: ${({ theme }) => theme.colors.outlineVariant + '40'};
`;

const ContentBox = styled.View`
  padding: ${Spacing.xl}px;
  align-items: center;
`;

const BalanceLabel = styled(Label)`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${Spacing.xs}px;
  letter-spacing: 2px;
`;

const BalanceAmount = styled(Display)`
  font-size: 44px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const DecorationCircle = styled(LinearGradient)`
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 75px;
  top: -75px;
  right: -50px;
  opacity: 0.2;
`;

export const BalanceCard: React.FC<BalanceCardProps> = ({ totalBalance }) => {
  const theme = useTheme();
  const isPositive = totalBalance >= 0;

  return (
    <CardContainer>
      <DecorationCircle 
        colors={[theme.colors.primary, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ContentBox>
        <BalanceLabel>Total Balance</BalanceLabel>
        <BalanceAmount>
          {isPositive ? '' : '-'}${Math.abs(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </BalanceAmount>
      </ContentBox>
    </CardContainer>
  );
};
