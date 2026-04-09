import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { BodyMd } from './Typography';

interface ButtonContainerProps {
  variant: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  background-color: ${({ theme, variant, disabled }: ButtonContainerProps & { theme: any }) => {
    if (disabled) return theme.colors.surfaceContainerHigh;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.primaryContainer;
    return 'transparent';
  }};
  padding: ${Spacing.md}px ${Spacing.xl}px;
  border-radius: ${Radius.full}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-width: ${({ variant }: ButtonContainerProps) => (variant === 'outline' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const ButtonText = styled(BodyMd)<ButtonContainerProps>`
  color: ${({ theme, variant, disabled }: ButtonContainerProps & { theme: any }) => {
    if (disabled) return theme.colors.onSurfaceVariant;
    if (variant === 'primary') return theme.colors.onPrimaryFixed;
    return theme.colors.primary;
  }};
  font-weight: 700;
`;

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  icon,
  style
}) => {
  return (
    <ButtonContainer 
      variant={variant} 
      onPress={onPress} 
      disabled={disabled} 
      activeOpacity={0.8}
      style={style}
    >
      {icon && (
        <MaterialIcons 
          name={icon as any} 
          size={18} 
          color={disabled ? '#999' : (variant === 'primary' ? 'white' : '#8083FF')} 
          style={{ marginRight: Spacing.xs }}
        />
      )}
      <ButtonText variant={variant} disabled={disabled}>{title}</ButtonText>
    </ButtonContainer>
  );
};
