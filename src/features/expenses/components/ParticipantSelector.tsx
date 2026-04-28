import React from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components/native';
import { Avatar } from '@/shared/components/Avatar';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { User } from '@/shared/types';
import { Check } from 'lucide-react-native';

const Container = styled.View`
  padding-vertical: ${Spacing.md}px;
`;

const UserItem = styled.TouchableOpacity<{ selected: boolean }>`
  align-items: center;
  margin-right: ${Spacing.md}px;
  width: 64px;
  opacity: ${({ selected }: { selected: boolean }) => (selected ? 1 : 0.5)};
`;

const SelectedBadge = styled.View`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${Radius.full}px;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.colors.background};
`;

const NameLabel = styled.Text`
  margin-top: ${Spacing.xs}px;
  text-align: center;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

interface ParticipantSelectorProps {
  members: User[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  members,
  selectedIds,
  onToggle,
}) => {
  return (
    <Container>
      <FlatList
        data={members}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.screenPadding }}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <UserItem selected={isSelected} activeOpacity={0.7} onPress={() => onToggle(item.id)}>
              <View>
                <Avatar name={item.name} size={Spacing.avatarMd} />
                {isSelected && (
                  <SelectedBadge>
                    <Check size={12} color="white" />
                  </SelectedBadge>
                )}
              </View>
              <NameLabel numberOfLines={1}>{item.name}</NameLabel>
            </UserItem>
          );
        }}
      />
    </Container>
  );
};
