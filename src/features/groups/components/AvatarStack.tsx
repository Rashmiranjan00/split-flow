import React from 'react';
import styled from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';

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
}

const StackItem = styled.View<StackItemProps>`
  width: ${(props: StackItemProps) => props.size}px;
  height: ${(props: StackItemProps) => props.size}px;
  border-radius: ${(props: StackItemProps) => props.size / 2}px;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: 2px;
  margin-left: ${(props: StackItemProps) => -props.size / 4}px;
`;

const MoreBadge = styled.View<StackItemProps>`
  width: ${(props: StackItemProps) => props.size - 4}px;
  height: ${(props: StackItemProps) => props.size - 4}px;
  border-radius: ${(props: StackItemProps) => (props.size - 4) / 2}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  align-items: center;
  justify-content: center;
`;

const MoreText = styled.Text<StackItemProps>`
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  font-size: ${(props: StackItemProps) => props.size / 3}px;
  font-weight: 600;
`;

export const AvatarStack: React.FC<AvatarStackProps> = ({ 
  users, 
  size = 24, 
  max = 4 
}) => {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <Container>
      {displayUsers.map((user, index) => (
        <StackItem key={index} size={size} style={{ zIndex: max - index }}>
          <Avatar name={user.name} imageUrl={user.avatarUrl} size={size - 4} />
        </StackItem>
      ))}
      {remaining > 0 && (
        <StackItem size={size} style={{ zIndex: 0 }}>
          <MoreBadge size={size}>
            <MoreText size={size}>+{remaining}</MoreText>
          </MoreBadge>
        </StackItem>
      )}
    </Container>
  );
};
