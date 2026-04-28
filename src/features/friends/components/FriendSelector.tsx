import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SpaceBetweenRow, Spacer, TxnRow } from '@/shared/components/Layout';
import { BodyMd, RowSubtitle, RowTitle } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useFriends } from '@/features/friends/hooks/useFriends';
import type { User } from '@/shared/types';

const SearchField = styled.View`
  flex-direction: row;
  align-items: center;
  height: 44px;
  padding: 0 ${Spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${Radius.inputRadius}px;
`;

const SearchInput = styled.TextInput`
  flex: 1;
  margin-left: ${Spacing.sm}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const Checkbox = styled.View<{ checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: ${({ checked }: { checked: boolean }) => (checked ? 0 : 1.5)}px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  background-color: ${({ theme, checked }: { theme: any; checked: boolean }) =>
    checked ? theme.colors.primary : 'transparent'};
  align-items: center;
  justify-content: center;
`;

const EmptyState = styled.View`
  padding: ${Spacing.lg}px;
  align-items: center;
`;

const LoadingWrap = styled.View`
  padding: ${Spacing.md}px;
  align-items: center;
`;

const CountText = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.medium};
  color: ${({ theme }) => theme.colors.primary};
`;

interface FriendSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** Friend ids to hide from the list (e.g. already group members). */
  excludeIds?: string[];
  /** Label above the picker. */
  label?: string;
  /** Placeholder for the inline search input. */
  searchPlaceholder?: string;
  /** Optional empty-state hint. */
  emptyHint?: string;
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  selectedIds,
  onChange,
  excludeIds = [],
  label = 'Friends',
  searchPlaceholder = 'Search friends',
  emptyHint,
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const { friends, isLoading, error } = useFriends();

  const filtered = useMemo(() => {
    const excluded = new Set(excludeIds);
    const q = query.trim().toLowerCase();
    return friends
      .filter((f) => !excluded.has(f.id))
      .filter(
        (f) =>
          q.length === 0 ||
          f.name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q)
      );
  }, [friends, excludeIds, query]);

  const toggle = (user: User) => {
    const isSelected = selectedIds.includes(user.id);
    onChange(
      isSelected
        ? selectedIds.filter((id) => id !== user.id)
        : [...selectedIds, user.id]
    );
  };

  return (
    <View>
      <SpaceBetweenRow style={{ marginBottom: Spacing.sm }}>
        <BodyMd style={{ fontFamily: TypographyTokens.fonts.medium }}>{label}</BodyMd>
        {selectedIds.length > 0 ? (
          <CountText>{selectedIds.length} selected</CountText>
        ) : null}
      </SpaceBetweenRow>

      <SearchField>
        <MaterialIcons name="search" size={18} color={theme.colors.onSurfaceVariant} />
        <SearchInput
          placeholder={searchPlaceholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </SearchField>

      <Spacer size="sm" />

      {isLoading ? (
        <LoadingWrap>
          <ActivityIndicator color={theme.colors.primary} />
        </LoadingWrap>
      ) : error ? (
        <EmptyState>
          <BodyMd style={{ color: theme.colors.danger, textAlign: 'center' }}>
            Something went wrong loading friends.
          </BodyMd>
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <BodyMd style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
            {friends.length === 0
              ? emptyHint ?? 'Add some friends first.'
              : query.length > 0
              ? `No friends match "${query}".`
              : 'Everyone is already in this group.'}
          </BodyMd>
        </EmptyState>
      ) : (
        filtered.map((friend, idx) => {
          const checked = selectedIds.includes(friend.id);
          return (
            <TxnRow
              key={friend.id}
              isLast={idx === filtered.length - 1}
              onPress={() => toggle(friend)}
              leading={<Avatar name={friend.name} imageUrl={friend.avatarUrl} />}
              title={<RowTitle numberOfLines={1}>{friend.name}</RowTitle>}
              subtitle={<RowSubtitle numberOfLines={1}>{friend.email}</RowSubtitle>}
              trailing={
                <Checkbox checked={checked}>
                  {checked ? (
                    <MaterialIcons name="check" size={16} color={theme.colors.onPrimary} />
                  ) : null}
                </Checkbox>
              }
            />
          );
        })
      )}
    </View>
  );
};
