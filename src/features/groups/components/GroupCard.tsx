import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Title, BodySm, BodyMd, Label } from '@/shared/components/Typography';
import { AvatarStack } from './AvatarStack';
import { Row, SpaceBetweenRow, Spacer } from '@/shared/components/Layout';

interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
}

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface GroupCardProps {
  group: Group;
  balance: number;
  members: User[];
  onPress: () => void;
}

const CardContainer = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.xl}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
`;

const GroupIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  align-items: center;
  justify-content: center;
`;

const GroupEmoji = styled.Text`
  font-size: 24px;
`;

const TextContainer = styled.View`
  flex: 1;
`;

interface BalanceBadgeProps {
  positive: boolean;
  tertiaryColor: string;
  errorColor: string;
}

const BalanceBadge = styled.View<BalanceBadgeProps>`
  background-color: ${(props: BalanceBadgeProps) =>
    props.positive
      ? props.tertiaryColor + '1F'
      : props.errorColor + '1F'};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.sm}px;
  padding-vertical: 4px;
`;

const BalanceText = styled(BodySm)<{ positive: boolean }>`
  color: ${({ positive, theme }: { positive: boolean; theme: any }) => positive ? theme.colors.tertiary : theme.colors.error};
  font-weight: 700;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-vertical: ${Spacing.md}px;
`;

export const GroupCard: React.FC<GroupCardProps> = ({ 
  group, 
  balance, 
  members, 
  onPress 
}) => {
  const theme = useTheme();
  const isPositive = balance >= 0;
  
  const getGroupEmoji = (name: string) => {
    if (name.includes('🏖')) return '🏖';
    if (name.includes('🏠')) return '🏠';
    if (name.includes('🍽')) return '🍽';
    return '💼';
  };

  const displayName = group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();

  return (
    <CardContainer onPress={onPress} activeOpacity={0.7}>
      <Row style={{ marginBottom: 0 }}>
        <GroupIcon>
          <GroupEmoji>{getGroupEmoji(group.name)}</GroupEmoji>
        </GroupIcon>
        <Spacer size="md" horizontal />
        <TextContainer>
          <Title numberOfLines={1}>{displayName}</Title>
          <BodySm style={{ opacity: 0.7 }} numberOfLines={1}>
            {group.description || 'No description'}
          </BodySm>
        </TextContainer>
        
        <BalanceBadge
          positive={isPositive}
          tertiaryColor={theme.colors.tertiary}
          errorColor={theme.colors.error}
        >
          <BalanceText positive={isPositive}>
            {isPositive ? '+' : '-'}${Math.abs(balance).toFixed(0)}
          </BalanceText>
        </BalanceBadge>
      </Row>

      <Divider />

      <SpaceBetweenRow style={{ marginBottom: 0 }}>
        <AvatarStack 
          users={members.map(m => ({ name: m.name, avatarUrl: m.avatarUrl }))} 
          size={28} 
        />
        <BodySm style={{ opacity: 0.7 }}>
          {group.members.length} members
        </BodySm>
      </SpaceBetweenRow>
    </CardContainer>
  );
};
