import React from 'react';
import styled from 'styled-components/native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SurfaceCard } from '@/shared/components/Layout';

export type StatTone = 'positive' | 'negative' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string;
  tone?: StatTone;
  caption?: string;
  style?: any;
}

const Container = styled(SurfaceCard)`
  flex: 1;
`;

const LabelText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const ValueText = styled.Text<{ tone: StatTone }>`
  margin-top: ${Spacing.xs}px;
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 22px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.4px;
  color: ${({ theme, tone }: { theme: any; tone: StatTone }) =>
    tone === 'positive'
      ? theme.colors.tertiary
      : tone === 'negative'
        ? theme.colors.danger
        : theme.colors.onSurface};
`;

const CaptionText = styled.Text`
  margin-top: ${Spacing.xs}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

/**
 * Compact stat tile used inside Insights tabs. Accepts a pre-formatted
 * `value` string (the caller decides how to format currency/plurals), plus
 * an optional caption beneath.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  tone = 'neutral',
  caption,
  style,
}) => (
  <Container style={style}>
    <LabelText>{label}</LabelText>
    <ValueText tone={tone}>{value}</ValueText>
    {caption ? <CaptionText>{caption}</CaptionText> : null}
  </Container>
);
