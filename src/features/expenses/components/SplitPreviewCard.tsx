import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { BodySm, Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { User, UserId, SplitDetail } from '@/shared/types';
import { Avatar } from '@/shared/components/Avatar';
import { View } from 'react-native';

import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.lg}px;
  margin-horizontal: ${Spacing.lg}px;
  padding: ${Spacing.lg}px;
`;

const OwesRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.sm}px;
`;

interface SplitPreviewCardProps {
  paidBy: UserId;
  splitDetails: SplitDetail[];
  allMembers: User[];
}

export const SplitPreviewCard: React.FC<SplitPreviewCardProps> = ({
  paidBy,
  splitDetails,
  allMembers,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();
  const payer = allMembers.find(m => m.id === paidBy);

  return (
    <Card>
      <Label style={{ marginBottom: Spacing.md, opacity: 0.7 }}>SUMMARY</Label>
      {splitDetails.map((detail) => {
        if (detail.userId === paidBy) return null;
        if (detail.owedAmount <= 0) return null;

        const debtor = allMembers.find(m => m.id === detail.userId);
        
        return (
          <OwesRow key={detail.userId}>
            <Avatar name={debtor?.name || 'User'} size={24} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <BodySm>
                <BodySm style={{ fontWeight: '700' }}>{debtor?.id === 'me' ? 'You' : debtor?.name}</BodySm>
                {` owes `}
                <BodySm style={{ fontWeight: '700' }}>{payer?.id === 'me' ? 'You' : payer?.name}</BodySm>
              </BodySm>
            </View>
            <BodySm style={{ fontWeight: '700', color: theme.colors.primary }}>
              {formatCurrency(detail.owedAmount)}
            </BodySm>
          </OwesRow>
        );
      })}
      
      {splitDetails.every(d => d.userId === paidBy || d.owedAmount <= 0) && (
        <BodySm style={{ opacity: 0.6, fontStyle: 'italic' }}>
          No debts created. Payer is the sole participant.
        </BodySm>
      )}
    </Card>
  );
};
