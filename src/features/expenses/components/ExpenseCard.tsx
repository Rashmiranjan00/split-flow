import React from 'react';
import styled from 'styled-components/native';
import { Colors } from '@/shared/constants/colors';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography } from '@/shared/constants/typography';

const CardContainer = styled.TouchableOpacity`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.md}px;
  padding: ${Spacing.md}px;
  margin-bottom: ${Spacing.sm}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LeftSide = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${Colors.surfaceContainerHigh};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const TitleColumn = styled.View``;

const Title = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

const Subtitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
`;

const AmountColumn = styled.View`
  align-items: flex-end;
`;

const Amount = styled.Text<{ highlight: boolean }>`
    color: ${({ highlight }: { highlight: boolean }) => (highlight ? Colors.tertiary : Colors.onSurface)};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

const DateText = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: 12px;
`;

interface ExpenseCardProps {
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  highlighted?: boolean;
  onPress: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  title,
  subtitle,
  amount,
  date,
  highlighted = false,
  onPress,
}) => {
  return (
    <CardContainer activeOpacity={0.8} onPress={onPress}>
      <LeftSide>
        <IconWrapper>
          <Title style={{ fontSize: 20 }}>💸</Title>
        </IconWrapper>
        <TitleColumn>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TitleColumn>
      </LeftSide>
      <AmountColumn>
        <Amount highlight={highlighted}>
          ${Math.abs(amount).toFixed(2)}
        </Amount>
        <DateText>{date}</DateText>
      </AmountColumn>
    </CardContainer>
  );
};
