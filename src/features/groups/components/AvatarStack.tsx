import React from 'react';
import styled from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

interface AvatarStackProps {
  users: { name: string; avatarUrl?: string }[];
  size?: number;
  max?: number;
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
`;

interface StackItemProps {
  size: number;
  index: number;
}

const StackItem = styled.View<StackItemProps>`
  width: ${(props: StackItemProps) => props.size}px;
  height: ${(props: StackItemProps) => props.size}px;
  border-radius: ${(props: StackItemProps) => props.size / 2}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  margin-left: ${(props: StackItemProps) => (props.index === 0 ? 0 : -8)}px;
`;

const MoreBadge = styled.View<{ size: number }>`
  width: ${(props: { size: number }) => props.size - 4}px;
  height: ${(props: { size: number }) => props.size - 4}px;
  border-radius: ${(props: { size: number }) => (props.size - 4) / 2}px;
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  align-items: center;
  justify-content: center;
  margin: 2px;
`;

const MoreText = styled.Text<{ size: number }>`
  color: ${({ theme }) => theme.colors.brandDark};
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: ${(props: { size: number }) => Math.max(props.size / 3, 10)}px;
  font-weight: ${TypographyTokens.weights.semibold};
`;

export const AvatarStack: React.FC<AvatarStackProps> = ({
  users,
  size = 28,
  max = 4,
}) => {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <Container>
      {displayUsers.map((user, index) => (
        <StackItem key={index} size={size} index={index} style={{ zIndex: max - index }}>
          <Avatar name={user.name} imageUrl={user.avatarUrl} size={size - 4} />
        </StackItem>
      ))}
      {remaining > 0 && (
        <StackItem size={size} index={displayUsers.length} style={{ zIndex: 0 }}>
          <MoreBadge size={size}>
            <MoreText size={size}>+{remaining}</MoreText>
          </MoreBadge>
        </StackItem>
      )}
    </Container>
  );
};
