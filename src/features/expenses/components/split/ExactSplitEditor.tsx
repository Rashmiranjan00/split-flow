import React from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { RowTitle, RowSubtitle } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SplitDetail, User } from '@/shared/types';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View``;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px 0;
`;

const CurrencySymbol = styled.Text`
  margin-right: 4px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const AmountInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.sm}px;
  padding: 6px ${Spacing.sm}px;
  width: 90px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
`;

const StatusText = styled.Text<{ ok: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  color: ${({ ok, theme }: { ok: boolean; theme: any }) =>
    ok ? theme.colors.primary : theme.colors.danger};
`;

interface ExactSplitEditorProps {
  participants: string[];
  allMembers: User[];
  splitDetails: SplitDetail[];
  onUpdate: (details: SplitDetail[]) => void;
  totalAmount: number;
}

export const ExactSplitEditor: React.FC<ExactSplitEditorProps> = ({
  participants,
  allMembers,
  splitDetails,
  onUpdate,
  totalAmount,
}) => {
  const { currencySymbol, formatCurrency } = useCurrencyFormatter();

  const handleValueChange = (userId: string, value: string) => {
    const floatValue = parseFloat(value) || 0;
    const newDetails = [...splitDetails];
    const index = newDetails.findIndex((d) => d.userId === userId);

    if (index > -1) {
      newDetails[index] = { ...newDetails[index], owedAmount: floatValue };
    } else {
      newDetails.push({ userId, owedAmount: floatValue });
    }

    onUpdate(newDetails);
  };

  const currentTotal = splitDetails.reduce((acc, d) => acc + d.owedAmount, 0);
  const difference = totalAmount - currentTotal;

  return (
    <Container>
      {allMembers.map((member) => {
        const detail = splitDetails.find((d) => d.userId === member.id);
        if (!participants.includes(member.id)) return null;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={Spacing.avatarSm} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <RowTitle>{member.name}</RowTitle>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CurrencySymbol>{currencySymbol}</CurrencySymbol>
              <AmountInput
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={detail?.owedAmount ? detail.owedAmount.toString() : ''}
                onChangeText={(val) => handleValueChange(member.id, val)}
              />
            </View>
          </ParticipantRow>
        );
      })}

      <View style={{ alignItems: 'flex-end', marginTop: Spacing.sm }}>
        <StatusText ok={Math.abs(difference) < 0.01}>
          {Math.abs(difference) < 0.01
            ? 'Total matches'
            : `${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'left' : 'over'}`}
        </StatusText>
      </View>
    </Container>
  );
};
