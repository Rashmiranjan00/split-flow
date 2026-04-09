import React from 'react';
import styled from 'styled-components/native';
import { Colors } from '@/shared/constants/colors';
import { Typography } from '@/shared/constants/typography';

interface AvatarProps {
  name: string;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  imageUrl?: string;
}

interface ContainerProps {
  size: number;
  borderWidth?: number;
  borderColor?: string;
}

const AvatarContainer = styled.View<ContainerProps>`
  width: ${(props: ContainerProps) => props.size}px;
  height: ${(props: ContainerProps) => props.size}px;
  border-radius: ${(props: ContainerProps) => props.size / 2}px;
  background-color: ${Colors.primaryContainer};
  align-items: center;
  justify-content: center;
  ${(props: ContainerProps) => props.borderWidth ? `border-width: ${props.borderWidth}px; border-color: ${props.borderColor || Colors.outlineVariant};` : ''}
`;

const AvatarImage = styled.Image<{ size: number }>`
  width: ${(props: { size: number }) => props.size}px;
  height: ${(props: { size: number }) => props.size}px;
  border-radius: ${(props: { size: number }) => props.size / 2}px;
`;

const AvatarInitial = styled.Text<{ size: number }>`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${(props: { size: number }) => Math.max(props.size / 2.5, 12)}px;
  font-weight: ${Typography.weights.bold};
`;

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  size = 40, 
  borderWidth, 
  borderColor,
  imageUrl
}) => {
  const initial = (name?.[0] ?? 'U').toUpperCase();

  return (
    <AvatarContainer size={size} borderWidth={borderWidth} borderColor={borderColor}>
      {imageUrl ? (
        <AvatarImage source={{ uri: imageUrl }} size={size} />
      ) : (
        <AvatarInitial size={size}>{initial}</AvatarInitial>
      )}
    </AvatarContainer>
  );
};
