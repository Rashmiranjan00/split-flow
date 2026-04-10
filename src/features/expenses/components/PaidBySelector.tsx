import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { BodyMd, Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { User, UserId } from '@/shared/types';
import { MaterialIcons } from '@expo/vector-icons';

const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.lg}px;
  margin-horizontal: ${Spacing.lg}px;
  overflow: hidden;
`;

const MemberItem = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.lg}px;
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryContainer : 'transparent'};
`;

interface PaidBySelectorProps {
  members: User[];
  selectedId: UserId;
  onSelect: (id: UserId) => void;
}

export const PaidBySelector: React.FC<PaidBySelectorProps> = ({
  members,
  selectedId,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Container>
      {members.map((member) => (
        <MemberItem
          key={member.id}
          selected={member.id === selectedId}
          activeOpacity={0.7}
          onPress={() => onSelect(member.id)}
        >
          <Avatar name={member.name} size={32} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <BodyMd style={{ fontWeight: member.id === selectedId ? '700' : '400' }}>
              {member.name}
            </BodyMd>
          </View>
          {member.id === selectedId && (
            <MaterialIcons name="check" size={20} color={theme.colors.primary} />
          )}
        </MemberItem>
      ))}
    </Container>
  );
};
