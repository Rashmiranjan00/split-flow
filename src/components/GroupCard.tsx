import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { AvatarStack } from '@/components/AvatarStack';

const CardContainer = styled.TouchableOpacity`
  background-color: ${Colors.surfaceContainerHigh};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${Spacing.md}px;
`;

const Title = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.semiBold};
  margin-bottom: ${Spacing.xs}px;
`;

const Subtitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
`;

const Amount = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean }) => (positive ? Colors.tertiary : Colors.error)};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
`;

interface GroupCardProps {
  title: string;
  description?: string;
  memberAvatars: string[];
  userBalance: number;
  onPress: () => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  title,
  description,
  memberAvatars,
  userBalance,
  onPress,
}) => {
  return (
    <CardContainer activeOpacity={0.8} onPress={onPress}>
      <HeaderRow>
        <Title>{title}</Title>
        <Amount positive={userBalance >= 0}>
          {userBalance >= 0 ? '+' : '-'}${Math.abs(userBalance).toFixed(2)}
        </Amount>
      </HeaderRow>
      <HeaderRow>
        <Subtitle>{description}</Subtitle>
        <AvatarStack urls={memberAvatars} />
      </HeaderRow>
    </CardContainer>
  );
};
