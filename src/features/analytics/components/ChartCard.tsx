import React from 'react';
import styled from 'styled-components/native';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SurfaceCard } from '@/shared/components/Layout';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any;
}

const Container = styled(SurfaceCard)`
  padding: ${Spacing.md}px;
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

const Body = styled.View`
  margin-top: ${Spacing.md}px;
`;

/**
 * Standard chart container used on the Insights tab. Provides the title,
 * optional subtitle and a top-margin wrapper so each chart sits on a
 * consistent rhythm.
 */
export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  style,
}) => (
  <Container style={style}>
    <TitleText>{title}</TitleText>
    {subtitle ? <SubtitleText>{subtitle}</SubtitleText> : null}
    <Body>{children}</Body>
  </Container>
);
