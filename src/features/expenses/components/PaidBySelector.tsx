import React from 'react';
import { View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { RowTitle } from '@/shared/components/Typography';
import { Spacing } from '@/shared/constants/spacing';
import { User, UserId } from '@/shared/types';
import { Check } from 'lucide-react-native';

const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
`;

const MemberItem = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: 12px ${Spacing.screenPadding}px;
  background-color: ${({ selected, theme }: { selected: boolean; theme: any }) =>
    selected ? theme.colors.surfaceContainerLow : 'transparent'};
`;

const RowDivider = styled.View`
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-left: ${Spacing.screenPadding + Spacing.avatarSm + Spacing.md}px;
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
      {members.map((member, idx) => (
        <React.Fragment key={member.id}>
          <MemberItem
            selected={member.id === selectedId}
            activeOpacity={0.7}
            onPress={() => onSelect(member.id)}
          >
            <Avatar name={member.name} size={Spacing.avatarSm} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <RowTitle>{member.name}</RowTitle>
            </View>
            {member.id === selectedId && (
              <Check size={20} color={theme.colors.primary} />
            )}
          </MemberItem>
          {idx < members.length - 1 && <RowDivider />}
        </React.Fragment>
      ))}
    </Container>
  );
};
