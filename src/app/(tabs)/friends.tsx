import React, { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { Screen, Content, Spacer, SurfaceCard, TxnRow } from '@/shared/components/Layout';
import {
  BodyMd,
  RowSubtitle,
  RowTitle,
  SectionLabel,
  Title,
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import { useFriendBalances } from '@/features/friends/hooks/useFriendBalances';
import { useRemoveFriendMutation } from '@/features/friends/hooks/useFriendMutations';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import type { User } from '@/shared/types';

const HeaderPadding = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.sm}px;
`;

const ScreenTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 24px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const SearchRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${Spacing.sm}px;
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px ${Spacing.md}px;
`;

const SearchField = styled.View`
  flex: 1;
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

const IconSquare = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${Radius.inputRadius}px;
`;

const IconBadge = styled.View`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.danger};
  border-radius: 9px;
`;

const IconBadgeText = styled.Text`
  color: #ffffff;
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 10px;
  font-weight: ${TypographyTokens.weights.semibold};
`;

const SectionBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${Spacing.screenPadding}px ${Spacing.sectionGap}px;
`;

const ListCard = styled(SurfaceCard)`
  margin: 0 ${Spacing.screenPadding}px;
  padding: 0;
  overflow: hidden;
`;

const BalanceText = styled.Text<{ tone: 'positive' | 'negative' | 'settled' }>`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  color: ${({ theme, tone }: { theme: any; tone: 'positive' | 'negative' | 'settled' }) =>
    tone === 'positive'
      ? theme.colors.tertiary
      : tone === 'negative'
      ? theme.colors.danger
      : theme.colors.onSurfaceVariant};
  text-align: right;
`;

const StatusLabel = styled.Text<{ tone: 'positive' | 'negative' | 'settled' }>`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 11px;
  letter-spacing: 0.1px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  text-align: right;
`;

const EmptyState = styled.View`
  align-items: center;
  padding: ${Spacing.xxxl}px ${Spacing.screenPadding}px;
`;

const EmptyEmoji = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 40px;
  margin-bottom: ${Spacing.md}px;
`;

const LoadingWrap = styled.View`
  padding: ${Spacing.xl}px;
  align-items: center;
`;

/**
 * Filters friends by name/email substring (case-insensitive).
 */
const filterFriends = (friends: User[], query: string): User[] => {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return friends;
  return friends.filter(
    (f) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
  );
};

const FriendsScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const { friends, isLoading: friendsLoading, error: friendsError } = useFriends();
  const { incomingCount } = useFriendRequests();
  const { getBalance, totalNet } = useFriendBalances();
  const removeFriendMutation = useRemoveFriendMutation();
  const { formatCurrency } = useCurrencyFormatter();

  const filtered = useMemo(() => filterFriends(friends, query), [friends, query]);

  const totalTone: 'positive' | 'negative' | 'settled' =
    totalNet > 0 ? 'positive' : totalNet < 0 ? 'negative' : 'settled';

  const handleRemove = (friend: User) => {
    Alert.alert(
      'Remove friend',
      `Remove ${friend.name} from your friends list? Any shared group memberships stay intact.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFriendMutation.mutate(friend.id),
        },
      ]
    );
  };

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderPadding>
          <ScreenTitle>Friends</ScreenTitle>
        </HeaderPadding>

        <SearchRow>
          <SearchField>
            <MaterialIcons name="search" size={18} color={theme.colors.onSurfaceVariant} />
            <SearchInput
              placeholder="Search friends"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </SearchField>
          <IconSquare
            activeOpacity={0.7}
            onPress={() => router.push('/friend-requests/search' as any)}
            accessibilityRole="button"
            accessibilityLabel="Add friend"
          >
            <MaterialIcons name="person-add-alt" size={20} color={theme.colors.primary} />
          </IconSquare>
          <IconSquare
            activeOpacity={0.7}
            onPress={() => router.push('/friend-requests/requests' as any)}
            accessibilityRole="button"
            accessibilityLabel="View friend requests"
          >
            <MaterialIcons name="inbox" size={20} color={theme.colors.primary} />
            {incomingCount > 0 ? (
              <IconBadge>
                <IconBadgeText>{incomingCount > 9 ? '9+' : String(incomingCount)}</IconBadgeText>
              </IconBadge>
            ) : null}
          </IconSquare>
        </SearchRow>

        <SectionBar>
          <SectionLabel>Your Friends</SectionLabel>
          <BodyMd style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
            Total balance:{' '}
            <BalanceText tone={totalTone}>
              {formatCurrency(Math.abs(totalNet), { decimals: 0 })}
            </BalanceText>
          </BodyMd>
        </SectionBar>

        {friendsLoading ? (
          <LoadingWrap>
            <ActivityIndicator color={theme.colors.primary} />
          </LoadingWrap>
        ) : friendsError ? (
          <EmptyState>
            <BodyMd style={{ color: theme.colors.danger, textAlign: 'center' }}>
              Something went wrong loading your friends.
            </BodyMd>
          </EmptyState>
        ) : friends.length === 0 ? (
          <EmptyState>
            <EmptyEmoji>👥</EmptyEmoji>
            <Title>No friends yet</Title>
            <Spacer size="sm" />
            <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
              Tap the{' '}
              <MaterialIcons
                name="person-add-alt"
                size={14}
                color={theme.colors.primary}
              />
              {'  '}button to search for someone by email.
            </BodyMd>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState>
            <BodyMd style={{ color: theme.colors.onSurfaceVariant }}>
              No friends match &quot;{query}&quot;.
            </BodyMd>
          </EmptyState>
        ) : (
          <ListCard>
            {filtered.map((friend, idx) => {
              const balance = getBalance(friend.id);
              const isLast = idx === filtered.length - 1;
              return (
                <TxnRow
                  key={friend.id}
                  isLast={isLast}
                  onPress={() => router.push(`/settle/${friend.id}` as any)}
                  onLongPress={() => handleRemove(friend)}
                  leading={<Avatar name={friend.name} imageUrl={friend.avatarUrl} />}
                  title={<RowTitle numberOfLines={1}>{friend.name}</RowTitle>}
                  subtitle={
                    <RowSubtitle numberOfLines={1}>{friend.email}</RowSubtitle>
                  }
                  trailing={
                    <>
                      <StatusLabel tone={balance.tone}>
                        {balance.tone === 'positive'
                          ? 'owes you'
                          : balance.tone === 'negative'
                          ? 'you owe'
                          : 'settled up'}
                      </StatusLabel>
                      <BalanceText tone={balance.tone}>
                        {formatCurrency(Math.abs(balance.net), { decimals: 0 })}
                      </BalanceText>
                    </>
                  }
                />
              );
            })}
          </ListCard>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </Content>
    </Screen>
  );
};

export default FriendsScreen;
