import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
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
  border-bottom-color: ${({ theme }) => theme.colors.outlineVariant};
`;

interface IconTypeProps {
  type: string;
  bgExpense: string;
  bgSettlement: string;
  bgDefault: string;
}

const IconContainer = styled.View<IconTypeProps>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${(props: IconTypeProps) => {
    switch (props.type) {
      case 'EXPENSE': return props.bgExpense;
      case 'SETTLEMENT': return props.bgSettlement;
      default: return props.bgDefault;
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
  color: ${({ positive, theme }: PositiveProps & { theme: any }) => positive ? theme.colors.tertiary : theme.colors.onSurfaceVariant};
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
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'EXPENSE': return 'receipt';
      case 'SETTLEMENT': return 'payment';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'EXPENSE': return theme.colors.primary;
      case 'SETTLEMENT': return theme.colors.tertiary;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  return (
    <ItemContainer activeOpacity={0.7} onPress={onPress}>
      <IconContainer
        type={type}
        bgExpense={theme.colors.primaryContainer}
        bgSettlement={theme.colors.tertiaryContainer}
        bgDefault={theme.colors.surfaceContainerHigh}
      >
        <MaterialIcons name={getIcon() as any} size={20} color={getIconColor()} />
      </IconContainer>
      
      <TextContainer>
        <BodyMd numberOfLines={1} style={{ fontWeight: '500' }}>{title}</BodyMd>
        <BodySm style={{ color: theme.colors.onSurfaceVariant }}>{subtitle}</BodySm>
      </TextContainer>
      
      {amount !== undefined && (
        <View style={{ alignItems: 'flex-end' }}>
          <AmountText positive={type === 'SETTLEMENT'}>
            {type === 'SETTLEMENT' ? '+' : ''}${Math.abs(amount).toFixed(2)}
          </AmountText>
          <BodySm style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>{date}</BodySm>
        </View>
      )}
    </ItemContainer>
  );
};

const View = styled.View``;
