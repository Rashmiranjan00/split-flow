import React from 'react';
import styled from 'styled-components/native';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

const BaseText = styled.Text`
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${TypographyTokens.fonts.body};
`;

export const Display = styled(BaseText)<{ positive?: boolean }>`
  font-family: ${TypographyTokens.fonts.display};
  font-size: ${TypographyTokens.sizes.displaySm}px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
  color: ${({ theme, positive }) => 
    positive === undefined ? theme.colors.onSurface : 
    positive ? theme.colors.tertiary : theme.colors.error};
`;

export const Headline = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.display};
  font-size: ${TypographyTokens.sizes.titleLg}px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
`;

export const Title = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.display};
  font-size: ${TypographyTokens.sizes.titleMd}px;
  font-weight: ${TypographyTokens.weights.semiBold};
`;

export const BodyMd = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.body};
  font-size: ${TypographyTokens.sizes.bodyMd}px;
`;

export const BodySm = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.body};
  font-size: ${TypographyTokens.sizes.bodySm}px;
`;

export const Label = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.body};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;
