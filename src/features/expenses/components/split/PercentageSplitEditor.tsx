import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
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

const PercentageInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.sm}px;
  padding: 6px ${Spacing.sm}px;
  width: 60px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
`;

const PercentSign = styled.Text`
  margin-left: 4px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const StatusText = styled.Text<{ ok: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  color: ${({ ok, theme }: { ok: boolean; theme: any }) =>
    ok ? theme.colors.primary : theme.colors.danger};
`;

interface PercentageSplitEditorProps {
  participants: string[];
  allMembers: User[];
  splitDetails: SplitDetail[];
  onUpdate: (details: SplitDetail[]) => void;
  totalAmount: number;
}

export const PercentageSplitEditor: React.FC<PercentageSplitEditorProps> = ({
  participants,
  allMembers,
  splitDetails,
  onUpdate,
  totalAmount,
}) => {
  const { formatCurrency } = useCurrencyFormatter();

  const handlePercentageChange = (userId: string, percentageStr: string) => {
    const percentage = parseFloat(percentageStr) || 0;
    const amount = (percentage / 100) * totalAmount;

    const newDetails = [...splitDetails];
    const index = newDetails.findIndex((d) => d.userId === userId);

    if (index > -1) {
      newDetails[index] = { ...newDetails[index], owedAmount: amount };
    } else {
      newDetails.push({ userId, owedAmount: amount });
    }

    onUpdate(newDetails);
  };

  const currentTotal = splitDetails.reduce((acc, d) => acc + d.owedAmount, 0);
  const currentPercentage = totalAmount > 0 ? (currentTotal / totalAmount) * 100 : 0;
  const difference = 100 - currentPercentage;

  return (
    <Container>
      {allMembers.map((member) => {
        const detail = splitDetails.find((d) => d.userId === member.id);
        if (!participants.includes(member.id)) return null;

        const percentage =
          detail && totalAmount > 0 ? (detail.owedAmount / totalAmount) * 100 : 0;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={Spacing.avatarSm} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <RowTitle>{member.name}</RowTitle>
              <RowSubtitle style={{ fontSize: 11 }}>
                {formatCurrency(detail?.owedAmount || 0)}
              </RowSubtitle>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PercentageInput
                keyboardType="numeric"
                placeholder="0"
                value={percentage ? Math.round(percentage).toString() : ''}
                onChangeText={(val) => handlePercentageChange(member.id, val)}
              />
              <PercentSign>%</PercentSign>
            </View>
          </ParticipantRow>
        );
      })}

      <View style={{ alignItems: 'flex-end', marginTop: Spacing.sm }}>
        <StatusText ok={Math.abs(difference) < 0.1}>
          {Math.abs(difference) < 0.1
            ? 'Total matches 100%'
            : `${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'left' : 'over'}`}
        </StatusText>
      </View>
    </Container>
  );
};
