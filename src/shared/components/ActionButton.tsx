import React from 'react';
import { ViewStyle } from 'react-native';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonContainerProps {
  variant: ButtonVariant;
  disabled?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<ButtonContainerProps>`
  background-color: ${({ theme, variant, disabled }: ButtonContainerProps & { theme: any }) => {
    if (disabled) return theme.colors.surfaceContainerHigh;
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.surfaceContainerLowest;
    return 'transparent';
  }};
  height: 50px;
  padding: 0 ${Spacing.xl}px;
  border-radius: ${Radius.buttonRadius}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-width: ${({ variant, disabled }: ButtonContainerProps) =>
    variant === 'outline' ? 1 : variant === 'secondary' && !disabled ? 1 : 0}px;
  border-color: ${({ theme, variant, disabled }: ButtonContainerProps & { theme: any }) => {
    if (disabled) return 'transparent';
    if (variant === 'outline') return theme.colors.primary;
    if (variant === 'secondary') return theme.colors.surfaceContainerHighest;
    return 'transparent';
  }};
`;

const ButtonText = styled.Text<ButtonContainerProps>`
  color: ${({ theme, variant, disabled }: ButtonContainerProps & { theme: any }) => {
    if (disabled) return theme.colors.onSurfaceVariant;
    if (variant === 'primary') return theme.colors.onPrimary;
    return theme.colors.primary;
  }};
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 16px;
  font-weight: ${TypographyTokens.weights.semibold};
`;

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
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
  style,
}) => {
  return (
    <ButtonContainer
      variant={variant}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={style}
    >
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={18}
          color={disabled ? '#BBBBBB' : variant === 'primary' ? '#FFFFFF' : '#006C4F'}
          style={{ marginRight: Spacing.sm }}
        />
      )}
      <ButtonText variant={variant} disabled={disabled}>
        {title}
      </ButtonText>
    </ButtonContainer>
  );
};
