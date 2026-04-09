import React from 'react';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

interface variant {
  variant: 'primary' | 'secondary' | 'glass';
}

const BaseButton = styled.TouchableOpacity<variant>`
  border-radius: ${Radius.full}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding-horizontal: ${Spacing.lg}px;
  padding-vertical: ${Spacing.md}px;
  
  ${({ variant }: variant) => variant === 'glass' && `
    background-color: ${Colors.glassFill};
    border-width: 0.5px;
    border-color: ${Colors.glassBorder};
  `}
  
  ${({ variant }: variant) => variant === 'secondary' && `
    background-color: ${Colors.surfaceContainerHigh};
  `}
`;

const GradientBg = styled(LinearGradient)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ButtonText = styled.Text<{ variant: 'primary' | 'secondary' | 'glass' }>`
  color: ${({ variant }: variant) => variant === 'primary' ? Colors.onPrimaryFixed : Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
}

export const ActionButton: React.FC<ActionButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  return (
    <BaseButton onPress={onPress} activeOpacity={0.8} variant={variant}>
      {variant === 'primary' && (
        <GradientBg
          colors={[Colors.primaryContainer, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <ButtonText variant={variant}>{title}</ButtonText>
    </BaseButton>
  );
};
