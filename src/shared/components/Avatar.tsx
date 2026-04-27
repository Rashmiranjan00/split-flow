import React from 'react';
import styled from 'styled-components/native';
import { Typography } from '@/shared/constants/typography';
import { Spacing } from '@/shared/constants/spacing';

interface AvatarProps {
  name: string;
  /** Pixel size. Defaults to 40 (avatarMd). Use Spacing.avatarSm/Md/Lg for the three canonical sizes. */
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
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  align-items: center;
  justify-content: center;
  ${(props: ContainerProps & { theme: any }) =>
    props.borderWidth
      ? `border-width: ${props.borderWidth}px; border-color: ${
          props.borderColor || props.theme.colors.outlineVariant
        };`
      : ''}
`;

const AvatarImage = styled.Image<{ size: number }>`
  width: ${(props: { size: number }) => props.size}px;
  height: ${(props: { size: number }) => props.size}px;
  border-radius: ${(props: { size: number }) => props.size / 2}px;
`;

const AvatarInitial = styled.Text<{ size: number }>`
  color: ${({ theme }) => theme.colors.brandDark};
  font-family: ${Typography.fonts.semibold};
  font-size: ${(props: { size: number }) => Math.max(props.size / 2.5, 12)}px;
  font-weight: ${Typography.weights.semibold};
`;

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = Spacing.avatarMd,
  borderWidth,
  borderColor,
  imageUrl,
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
