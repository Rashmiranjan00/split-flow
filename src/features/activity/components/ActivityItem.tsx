import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/shared/constants/colors';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { BodyMd, BodySm } from '@/shared/components/Typography';

interface ActivityItemProps {
  type: 'EXPENSE' | 'SETTLEMENT' | 'SYSTEM';
  title: string;
  subtitle: string;
  amount?: number;
  payerName: string;
  date: string;
  onPress?: () => void;
}

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${Spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

interface IconTypeProps {
  type: string;
}

const IconContainer = styled.View<IconTypeProps>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props: IconTypeProps) => {
    switch (props.type) {
      case 'EXPENSE': return Colors.primaryContainer;
      case 'SETTLEMENT': return Colors.tertiaryContainer;
      default: return Colors.surfaceContainerHigh;
    }
  }};
  align-items: center;
  justify-content: center;
`;

const TextContainer = styled.View`
  flex: 1;
  margin-horizontal: ${Spacing.md}px;
`;

interface PositiveProps {
  positive?: boolean;
}

const AmountText = styled(BodyMd)<PositiveProps>`
  color: ${(props: PositiveProps) => props.positive ? Colors.tertiary : Colors.onSurfaceVariant};
  font-weight: 600;
`;

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  subtitle,
  amount,
  date,
  onPress
}) => {
  const getIcon = () => {
    switch (type) {
      case 'EXPENSE': return 'receipt';
      case 'SETTLEMENT': return 'payment';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'EXPENSE': return Colors.primary;
      case 'SETTLEMENT': return Colors.tertiary;
      default: return Colors.onSurfaceVariant;
    }
  };

  return (
    <ItemContainer activeOpacity={0.7} onPress={onPress}>
      <IconContainer type={type}>
        <MaterialIcons name={getIcon() as any} size={20} color={getIconColor()} />
      </IconContainer>
      
      <TextContainer>
        <BodyMd numberOfLines={1} style={{ fontWeight: '500' }}>{title}</BodyMd>
        <BodySm style={{ color: Colors.onSurfaceVariant }}>{subtitle}</BodySm>
      </TextContainer>
      
      {amount !== undefined && (
        <View style={{ alignItems: 'flex-end' }}>
          <AmountText positive={type === 'SETTLEMENT'}>
            {type === 'SETTLEMENT' ? '+' : ''}${Math.abs(amount).toFixed(2)}
          </AmountText>
          <BodySm style={{ color: Colors.onSurfaceVariant, fontSize: 10 }}>{date}</BodySm>
        </View>
      )}
    </ItemContainer>
  );
};

const View = styled.View``;
