import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { TxnRow } from '@/shared/components/Layout';
import {
  Amount,
  RowTitle,
  RowSubtitle,
  Timestamp,
} from '@/shared/components/Typography';

interface ActivityItemProps {
  type: 'EXPENSE' | 'SETTLEMENT' | 'SYSTEM';
  title: string;
  subtitle: string;
  amount?: number;
  payerName: string;
  date: string;
  isLast?: boolean;
  onPress?: () => void;
}

const IconCircle = styled.View<{ bgColor: string }>`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${(props: { bgColor: string }) => props.bgColor};
  align-items: center;
  justify-content: center;
`;

const TrailingColumn = styled.View`
  align-items: flex-end;
`;

export const ActivityItem: React.FC<ActivityItemProps> = ({
  type,
  title,
  subtitle,
  amount,
  date,
  isLast,
  onPress,
}) => {
  const theme = useTheme();

  const { icon, bg, iconColor, positive } = (() => {
    switch (type) {
      case 'EXPENSE':
        return {
          icon: 'receipt-long' as const,
          bg: theme.colors.primaryFixedDim,
          iconColor: theme.colors.brandDark,
          positive: undefined as boolean | undefined,
        };
      case 'SETTLEMENT':
        return {
          icon: 'check-circle' as const,
          bg: theme.colors.tertiaryContainer,
          iconColor: theme.colors.secondary,
          positive: true,
        };
      default:
        return {
          icon: 'notifications' as const,
          bg: theme.colors.surfaceContainerHigh,
          iconColor: theme.colors.onSurfaceVariant,
          positive: undefined as boolean | undefined,
        };
    }
  })();

  return (
    <TxnRow
      onPress={onPress}
      isLast={isLast}
      leading={
        <IconCircle bgColor={bg}>
          <MaterialIcons name={icon} size={18} color={iconColor} />
        </IconCircle>
      }
      title={<RowTitle numberOfLines={1}>{title}</RowTitle>}
      subtitle={<RowSubtitle numberOfLines={1}>{subtitle}</RowSubtitle>}
      trailing={
        amount !== undefined ? (
          <TrailingColumn>
            <Amount positive={positive}>
              {type === 'SETTLEMENT' ? '+' : ''}${Math.abs(amount).toFixed(2)}
            </Amount>
            <Timestamp style={{ marginTop: 2 }}>{date}</Timestamp>
          </TrailingColumn>
        ) : (
          <Timestamp>{date}</Timestamp>
        )
      }
    />
  );
};
