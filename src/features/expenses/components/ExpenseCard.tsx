import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Receipt, type LucideIcon } from 'lucide-react-native';
import { TxnRow } from '@/shared/components/Layout';
import { Amount, RowTitle, RowSubtitle, Timestamp } from '@/shared/components/Typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const IconCircle = styled.View`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  background-color: ${({ theme }) => theme.colors.surfaceContainer};
  align-items: center;
  justify-content: center;
`;

const TrailingColumn = styled.View`
  align-items: flex-end;
`;

interface ExpenseCardProps {
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  /** Lucide icon component shown in the leading circle. Defaults to Receipt. */
  icon?: LucideIcon;
  /** true = teal (owed to you), false = coral, undefined = neutral. */
  highlighted?: boolean;
  isLast?: boolean;
  onPress: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  title,
  subtitle,
  amount,
  date,
  icon: Icon = Receipt,
  highlighted,
  isLast,
  onPress,
}) => {
  const { formatCurrency } = useCurrencyFormatter();
  const theme = useTheme();
  const positive = highlighted === undefined ? undefined : highlighted;

  return (
    <TxnRow
      onPress={onPress}
      isLast={isLast}
      leading={
        <IconCircle>
          <Icon size={18} color={theme.colors.onSurfaceVariant} />
        </IconCircle>
      }
      title={<RowTitle numberOfLines={1}>{title}</RowTitle>}
      subtitle={<RowSubtitle numberOfLines={1}>{subtitle}</RowSubtitle>}
      trailing={
        <TrailingColumn>
          <Amount positive={positive}>
            {formatCurrency(amount, { sign: amount !== 0 })}
          </Amount>
          <Timestamp style={{ marginTop: 2 }}>{date}</Timestamp>
        </TrailingColumn>
      }
    />
  );
};
