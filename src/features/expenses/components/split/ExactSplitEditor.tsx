import React from 'react';
import { View, TextInput } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { BodyMd, Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { SplitDetail, User } from '@/shared/types';

import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.md}px;
`;

const AmountInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: ${Radius.sm}px;
  padding: ${Spacing.xs}px ${Spacing.sm}px;
  width: 80px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
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
  const theme = useTheme();
  const { currencySymbol, formatCurrency } = useCurrencyFormatter();

  const handleValueChange = (userId: string, value: string) => {
    const floatValue = parseFloat(value) || 0;
    const newDetails = [...splitDetails];
    const index = newDetails.findIndex(d => d.userId === userId);
    
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
        const detail = splitDetails.find(d => d.userId === member.id);
        const isParticipant = participants.includes(member.id);
        
        if (!isParticipant) return null;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={32} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <BodyMd>{member.name}</BodyMd>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Label style={{ marginRight: Spacing.xs }}>{currencySymbol}</Label>
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
        <Label style={{ color: Math.abs(difference) < 0.01 ? theme.colors.primary : theme.colors.error }}>
          {difference === 0 ? 'Total matches' : `${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'left' : 'over'}`}
        </Label>
      </View>
    </Container>
  );
};
