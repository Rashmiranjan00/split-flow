import React from 'react';
import styled from 'styled-components/native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { HeroBalance, SectionLabel } from '@/shared/components/Typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

interface BalanceCardProps {
  totalBalance: number;
  totalOwedToYou?: number;
  totalYouOwe?: number;
}

const CardContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${Spacing.xl}px ${Spacing.lg}px;
  align-items: center;
`;

const PillRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  margin-top: ${Spacing.md}px;
`;

const Pill = styled.View<{ positive?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme, positive }) =>
    positive ? theme.colors.primaryFixedDim : theme.colors.dangerLight};
  border-radius: ${Radius.full}px;
  padding: 4px 10px;
`;

const PillDot = styled.View<{ positive?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme, positive }) =>
    positive ? theme.colors.brandDark : theme.colors.secondary};
  margin-right: 6px;
`;

const PillText = styled.Text<{ positive?: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, positive }) =>
    positive ? theme.colors.brandDark : theme.colors.secondary};
`;

export const BalanceCard: React.FC<BalanceCardProps> = ({
  totalBalance,
  totalOwedToYou,
  totalYouOwe,
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const isPositive = totalBalance >= 0;
  const label = isPositive ? 'YOU ARE OWED' : 'YOU OWE';

  return (
    <CardContainer>
      <SectionLabel style={{ marginBottom: Spacing.sm }}>{label}</SectionLabel>
      <HeroBalance positive={isPositive}>
        {formatCurrency(Math.abs(totalBalance), { sign: false, decimals: 0 })}
      </HeroBalance>

      {(totalOwedToYou !== undefined || totalYouOwe !== undefined) && (
        <PillRow>
          {totalOwedToYou !== undefined && (
            <Pill positive>
              <PillDot positive />
              <PillText positive>
                {formatCurrency(totalOwedToYou, { decimals: 0 })} owed to you
              </PillText>
            </Pill>
          )}
          {totalYouOwe !== undefined && (
            <Pill>
              <PillDot />
              <PillText>
                You owe {formatCurrency(totalYouOwe, { decimals: 0 })}
              </PillText>
            </Pill>
          )}
        </PillRow>
      )}
    </CardContainer>
  );
};
