import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { Radius } from '@/shared/constants/spacing';

interface GlassViewProps {
  /** Retained for backwards compatibility; no longer used. */
  intensity?: number;
  /** Retained for backwards compatibility; no longer used. */
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

/**
 * GlassView is kept for API backwards compatibility with existing call-sites.
 * The original frosted-glass effect (expo-blur) has been removed as part of
 * the "Warm Minimalist Finance" revamp. The component now renders a plain
 * white surface with the standard card radius and a hairline divider border.
 */
const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-radius: ${Radius.cardRadius}px;
  border-width: 0.5px;
  border-color: ${({ theme }) => theme.colors.divider};
  overflow: hidden;
`;

export const GlassView: React.FC<GlassViewProps> = ({ style, children }) => {
  return <Container style={style}>{children}</Container>;
};
