import React from 'react';
import styled from 'styled-components/native';
import { Colors } from '@/shared/constants/colors';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { BodyMd } from './Typography';

interface ButtonContainerProps {
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  background-color: ${(props: ButtonContainerProps) => {
    if (props.disabled) return Colors.surfaceContainerHigh;
    if (props.variant === 'primary') return Colors.primary;
    if (props.variant === 'secondary') return Colors.primaryContainer;
    return 'transparent';
  }};
  padding: ${Spacing.md}px ${Spacing.xl}px;
  border-radius: ${Radius.full}px;
  align-items: center;
  justify-content: center;
  border-width: ${(props: ButtonContainerProps) => (props.variant === 'outline' ? 1 : 0)}px;
  border-color: ${Colors.primary};
`;

const ButtonText = styled(BodyMd)<ButtonContainerProps>`
  color: ${(props: ButtonContainerProps) => {
    if (props.disabled) return Colors.onSurfaceVariant;
    if (props.variant === 'primary') return Colors.onPrimaryFixed;
    return Colors.primary;
  }};
  font-weight: 700;
`;

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false
}) => {
  return (
    <ButtonContainer variant={variant} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <ButtonText variant={variant} disabled={disabled}>{title}</ButtonText>
    </ButtonContainer>
  );
};
