import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SurfaceCard } from '@/shared/components/Layout';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useDateFormatter } from '@/shared/hooks/useDateFormatter';
import { getCategoryConfig } from '@/features/analytics/utils/categoryConfig';
import type { Expense } from '@/shared/types';

export interface TopExpenseCardProps {
  expense: Expense | null;
}

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconCircle = styled.View<{ bgColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${(props: { bgColor: string }) => props.bgColor};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const Center = styled.View`
  flex: 1;
  min-width: 0;
`;

const Trailing = styled.View`
  align-items: flex-end;
  margin-left: ${Spacing.sm}px;
`;

const TitleText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const SubtitleText = styled.Text`
  margin-top: 2px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const AmountText = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 18px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const DateText = styled.Text`
  margin-top: 2px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const HeaderLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: ${Spacing.sm}px;
`;

const Container = styled(SurfaceCard)`
  padding: ${Spacing.md}px;
`;

/**
 * Card that surfaces the largest expense in the current scope (group or
 * friend-pair). No chart — just a header row + category icon + amount.
 * Renders `null` when there is no expense to show.
 */
export const TopExpenseCard: React.FC<TopExpenseCardProps> = ({ expense }) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();
  const { formatDate } = useDateFormatter();

  if (!expense) return null;

  const category = getCategoryConfig(expense.category);
  const Icon = category.icon;

  return (
    <Container>
      <HeaderLabel>Top expense</HeaderLabel>
      <Row>
        <IconCircle bgColor={theme.colors.primaryFixedDim}>
          <Icon size={22} color={theme.colors.brandDark} />
        </IconCircle>
        <Center>
          <TitleText numberOfLines={1}>{expense.title}</TitleText>
          <SubtitleText numberOfLines={1}>{category.label}</SubtitleText>
        </Center>
        <Trailing>
          <AmountText>{formatCurrency(expense.amount, { decimals: 0 })}</AmountText>
          <DateText>{formatDate(expense.createdAt)}</DateText>
        </Trailing>
      </Row>
    </Container>
  );
};
