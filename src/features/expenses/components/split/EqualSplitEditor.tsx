import React from 'react';
import { View, Switch } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { BodyMd, Label } from '@/shared/components/Typography';
import { Spacing } from '@/shared/constants/spacing';
import { User } from '@/shared/types';

import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.md}px;
`;

interface EqualSplitEditorProps {
  participants: string[];
  allMembers: User[];
  onToggle: (id: string) => void;
  totalAmount: number;
}

export const EqualSplitEditor: React.FC<EqualSplitEditorProps> = ({
  participants,
  allMembers,
  onToggle,
  totalAmount,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();
  const perPerson = participants.length > 0 ? totalAmount / participants.length : 0;

  return (
    <Container>
      {allMembers.map((member) => (
        <ParticipantRow key={member.id}>
          <Avatar name={member.name} size={32} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <BodyMd>{member.name}</BodyMd>
          </View>
          <View style={{ alignItems: 'flex-end', marginRight: Spacing.md }}>
            <Label style={{ color: theme.colors.primary }}>
              {participants.includes(member.id) ? formatCurrency(perPerson) : formatCurrency(0)}
            </Label>
          </View>
          <Switch
            value={participants.includes(member.id)}
            onValueChange={() => onToggle(member.id)}
            trackColor={{ true: theme.colors.primary }}
          />
        </ParticipantRow>
      ))}
    </Container>
  );
};
