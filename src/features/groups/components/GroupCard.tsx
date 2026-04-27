import React from 'react';
import styled from 'styled-components/native';
import { TxnRow } from '@/shared/components/Layout';
import { Amount, RowSubtitle, RowTitle } from '@/shared/components/Typography';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

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
  /** Kept for API compatibility with existing call-sites; unused in the flat row design. */
  members?: User[];
  expenseCount?: number;
  onPress: () => void;
  isLast?: boolean;
}

const GroupIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  align-items: center;
  justify-content: center;
`;

const GroupEmoji = styled.Text`
  font-family: ${TypographyTokens.fonts.body};
  font-size: 20px;
`;

const getGroupEmoji = (name: string): string => {
  const match = name.match(/[\u{1F300}-\u{1FAFF}]/u);
  if (match) return match[0];
  if (name.toLowerCase().includes('trip')) return '✈️';
  if (name.toLowerCase().includes('home') || name.toLowerCase().includes('house')) return '🏠';
  if (name.toLowerCase().includes('food') || name.toLowerCase().includes('dinner')) return '🍽';
  return '💼';
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  balance,
  expenseCount,
  onPress,
  isLast,
}) => {
  const { formatCurrency } = useCurrencyFormatter();

  const displayName = group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();
  const subtitleParts: string[] = [`${group.members.length} member${group.members.length === 1 ? '' : 's'}`];
  if (expenseCount !== undefined) {
    subtitleParts.push(`${expenseCount} expense${expenseCount === 1 ? '' : 's'}`);
  }

  const positive = balance === 0 ? undefined : balance > 0;

  return (
    <TxnRow
      onPress={onPress}
      isLast={isLast}
      leading={
        <GroupIcon>
          <GroupEmoji>{getGroupEmoji(group.name)}</GroupEmoji>
        </GroupIcon>
      }
      title={<RowTitle numberOfLines={1}>{displayName}</RowTitle>}
      subtitle={<RowSubtitle numberOfLines={1}>{subtitleParts.join(' · ')}</RowSubtitle>}
      trailing={
        <Amount positive={positive}>
          {balance === 0 ? '—' : formatCurrency(Math.abs(balance), { decimals: 0 })}
        </Amount>
      }
    />
  );
};
