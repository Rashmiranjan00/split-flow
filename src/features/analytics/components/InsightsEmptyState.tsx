import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { TrendingUp } from 'lucide-react-native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

export interface InsightsEmptyStateProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

const Container = styled.View<{ compact: boolean }>`
  align-items: center;
  justify-content: center;
  padding: ${({ compact }: { compact: boolean }) =>
    compact ? `${Spacing.lg}px ${Spacing.md}px` : `${Spacing.xxxl}px ${Spacing.lg}px`};
`;

const IconWrap = styled.View`
  margin-bottom: ${Spacing.sm}px;
`;

const TitleText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center;
`;

const MessageText = styled.Text`
  margin-top: ${Spacing.xs}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-align: center;
`;

/**
 * Centered empty-state for analytics surfaces. Shown either when a whole
 * Insights tab has no data, or inside an individual chart card whose source
 * array is empty (victory-native throws on empty data).
 */
export const InsightsEmptyState: React.FC<InsightsEmptyStateProps> = ({
  title = 'No data yet',
  message = 'Add expenses to see insights',
  compact = false,
}) => {
  const theme = useTheme();
  return (
    <Container compact={compact}>
      <IconWrap>
        <TrendingUp size={compact ? 24 : 32} color={theme.colors.onSurfaceVariant} />
      </IconWrap>
      <TitleText>{title}</TitleText>
      <MessageText>{message}</MessageText>
    </Container>
  );
};
