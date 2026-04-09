import React from 'react';
import styled from 'styled-components/native';
import { BlurView } from 'expo-blur';
import { Platform, ViewStyle } from 'react-native';

interface GlassViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

const Container = styled.View`
  overflow: hidden;
`;

const AbsoluteBlur = styled(BlurView)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Overlay = styled.View<{ tintColor?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ tintColor }) => tintColor || 'transparent'};
`;

/**
 * GlassView: A reusable glassmorphic container using Expo Blur.
 * Provides a frosted glass effect with a tonal overlay.
 */
export const GlassView: React.FC<GlassViewProps> = ({ 
  intensity = 24, 
  tint = 'dark', 
  style, 
  children 
}) => {
  // Fallback for Android which doesn't support backdrop-filter well in some versions
  // or for web if not supported.
  const isWeb = Platform.OS === 'web';
  
  return (
    <Container style={style}>
      {!isWeb && (
        <AbsoluteBlur intensity={intensity} tint={tint} />
      )}
      {children}
    </Container>
  );
};
