import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { View } from 'react-native';
import { Avatar } from '@/shared/components/Avatar';
import { RowSubtitle, SectionLabel } from '@/shared/components/Typography';
import { Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { User, UserId, SplitDetail } from '@/shared/types';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const OwesRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.sm}px;
`;

const OweAmount = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.primary};
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
  const payer = allMembers.find((m) => m.id === paidBy);

  const owes = splitDetails.filter(
    (d) => d.userId !== paidBy && d.owedAmount > 0
  );

  return (
    <View>
      <SectionLabel style={{ marginBottom: Spacing.md, fontSize: 11 }}>
        Summary
      </SectionLabel>
      {owes.length === 0 ? (
        <RowSubtitle style={{ color: theme.colors.onSurfaceVariant }}>
          No debts created. Payer is the sole participant.
        </RowSubtitle>
      ) : (
        owes.map((detail) => {
          const debtor = allMembers.find((m) => m.id === detail.userId);
          return (
            <OwesRow key={detail.userId}>
              <Avatar name={debtor?.name || 'User'} size={24} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <RowSubtitle>
                  <RowSubtitle style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                    {debtor?.name ?? 'Someone'}
                  </RowSubtitle>
                  {' owes '}
                  <RowSubtitle style={{ fontWeight: '600', color: theme.colors.onSurface }}>
                    {payer?.name ?? 'someone'}
                  </RowSubtitle>
                </RowSubtitle>
              </View>
              <OweAmount>{formatCurrency(detail.owedAmount)}</OweAmount>
            </OwesRow>
          );
        })
      )}
    </View>
  );
};
