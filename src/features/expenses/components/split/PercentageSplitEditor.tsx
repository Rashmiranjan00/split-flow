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

const PercentageInput = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: ${Radius.sm}px;
  padding: ${Spacing.xs}px ${Spacing.sm}px;
  width: 60px;
  text-align: right;
  color: ${({ theme }) => theme.colors.onSurface};
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
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();

  const handlePercentageChange = (userId: string, percentageStr: string) => {
    const percentage = parseFloat(percentageStr) || 0;
    const amount = (percentage / 100) * totalAmount;
    
    const newDetails = [...splitDetails];
    const index = newDetails.findIndex(d => d.userId === userId);
    
    if (index > -1) {
      newDetails[index] = { ...newDetails[index], owedAmount: amount };
    } else {
      newDetails.push({ userId, owedAmount: amount });
    }
    
    onUpdate(newDetails);
  };

  const currentTotal = splitDetails.reduce((acc, d) => acc + d.owedAmount, 0);
  const currentPercentage = (currentTotal / totalAmount) * 100;
  const difference = 100 - currentPercentage;

  return (
    <Container>
      {allMembers.map((member) => {
        const detail = splitDetails.find(d => d.userId === member.id);
        const isParticipant = participants.includes(member.id);
        
        if (!isParticipant) return null;

        const percentage = detail ? (detail.owedAmount / totalAmount) * 100 : 0;

        return (
          <ParticipantRow key={member.id}>
            <Avatar name={member.name} size={32} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <BodyMd>{member.name}</BodyMd>
              <Label style={{ fontSize: 10, opacity: 0.6 }}>
                {formatCurrency(detail?.owedAmount || 0)}
              </Label>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <PercentageInput
                keyboardType="numeric"
                placeholder="0"
                value={percentage ? Math.round(percentage).toString() : ''}
                onChangeText={(val) => handlePercentageChange(member.id, val)}
              />
              <Label style={{ marginLeft: Spacing.xs }}>%</Label>
            </View>
          </ParticipantRow>
        );
      })}
      
      <View style={{ alignItems: 'flex-end', marginTop: Spacing.sm }}>
        <Label style={{ color: Math.abs(difference) < 0.1 ? theme.colors.primary : theme.colors.error }}>
          {Math.abs(difference) < 0.1 ? 'Total matches 100%' : `${Math.abs(difference).toFixed(1)}% ${difference > 0 ? 'left' : 'over'}`}
        </Label>
      </View>
    </Container>
  );
};
