import React from 'react';
import { View, Switch } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { RowTitle, Amount } from '@/shared/components/Typography';
import { Spacing } from '@/shared/constants/spacing';
import { User } from '@/shared/types';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const Container = styled.View``;

const ParticipantRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.sm}px 0;
`;

const RowDivider = styled.View`
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-left: ${Spacing.avatarSm + Spacing.md}px;
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
      {allMembers.map((member, idx) => {
        const isSelected = participants.includes(member.id);
        return (
          <View key={member.id}>
            <ParticipantRow>
              <Avatar name={member.name} size={Spacing.avatarSm} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <RowTitle>{member.name}</RowTitle>
              </View>
              <View style={{ alignItems: 'flex-end', marginRight: Spacing.md }}>
                <Amount positive={isSelected || undefined}>
                  {isSelected ? formatCurrency(perPerson) : formatCurrency(0)}
                </Amount>
              </View>
              <Switch
                value={isSelected}
                onValueChange={() => onToggle(member.id)}
                trackColor={{ true: theme.colors.brandAccent, false: theme.colors.surfaceContainerHigh }}
                thumbColor="#FFFFFF"
              />
            </ParticipantRow>
            {idx < allMembers.length - 1 && <RowDivider />}
          </View>
        );
      })}
    </Container>
  );
};
