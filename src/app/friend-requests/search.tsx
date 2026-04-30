import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, View } from 'react-native';
import { X, Search, XCircle, AtSign, SearchX } from 'lucide-react-native';
import { useConfirmSheet } from '@/shared/hooks/useConfirmSheet';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Row, Spacer, TxnRow } from '@/shared/components/Layout';
import { BodyMd, RowSubtitle, RowTitle } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useUserSearch } from '@/features/friends/hooks/useUserSearch';
import {
  useAcceptFriendRequestMutation,
  useSendFriendRequestMutation,
} from '@/features/friends/hooks/useFriendMutations';
import { LoadingView } from '@/shared/components/LoadingView';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const IconButton = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  text-align: center;
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const Body = styled.View`
  flex: 1;
  padding: ${Spacing.md}px ${Spacing.screenPadding}px 0;
`;

const SearchField = styled.View`
  flex-direction: row;
  align-items: center;
  height: 48px;
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
  font-size: 16px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const PillBase = styled.TouchableOpacity<{ variant: 'primary' | 'muted' | 'accept' }>`
  padding: 8px 14px;
  border-radius: ${Radius.full}px;
  border-width: ${({ variant }: { variant: 'primary' | 'muted' | 'accept' }) =>
    variant === 'muted' ? 1 : 0}px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  background-color: ${({
    theme,
    variant,
  }: {
    theme: any;
    variant: 'primary' | 'muted' | 'accept';
  }) => {
    if (variant === 'muted') return theme.colors.surfaceContainerLow;
    if (variant === 'accept') return theme.colors.primaryFixedDim;
    return theme.colors.primary;
  }};
`;

const PillText = styled.Text<{ variant: 'primary' | 'muted' | 'accept' }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, variant }: { theme: any; variant: 'primary' | 'muted' | 'accept' }) => {
    if (variant === 'muted') return theme.colors.onSurfaceVariant;
    if (variant === 'accept') return theme.colors.brandDark;
    return theme.colors.onPrimary;
  }};
`;

const StateMessage = styled.View`
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
  align-items: center;
`;

const ErrorBanner = styled.View`
  padding: ${Spacing.sm}px ${Spacing.md}px;
  margin-top: ${Spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.dangerLight};
  border-radius: ${Radius.md}px;
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.danger};
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
`;

const FriendSearchScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const [input, setInput] = useState('');

  const { isEmpty, isTooShort, isLoading, results, hasResults, query, error } =
    useUserSearch(input);

  const sendMutation = useSendFriendRequestMutation();
  const acceptMutation = useAcceptFriendRequestMutation();
  const [optimisticPendingIds, setOptimisticPendingIds] = useState<Set<string>>(new Set());
  const [optimisticAcceptedIds, setOptimisticAcceptedIds] = useState<Set<string>>(new Set());

  const { show } = useConfirmSheet();

  const handleSend = (userId: string) => {
    setOptimisticPendingIds((prev) => new Set(prev).add(userId));
    sendMutation.mutate(userId, {
      onError: (err: unknown) => {
        setOptimisticPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
        const message = err instanceof Error ? err.message : 'Failed to send request';
        show({
          title: 'Could not send request',
          message,
          actions: [{ label: 'OK', onPress: () => {} }],
        });
      },
    });
  };

  const handleAccept = (requestId: string) => {
    setOptimisticAcceptedIds((prev) => new Set(prev).add(requestId));
    acceptMutation.mutate(requestId, {
      onError: (err: unknown) => {
        setOptimisticAcceptedIds((prev) => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        const message = err instanceof Error ? err.message : 'Failed to accept request';
        show({
          title: 'Could not accept request',
          message,
          actions: [{ label: 'OK', onPress: () => {} }],
        });
      },
    });
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <X size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitle>Add Friend</HeaderTitle>
        <IconButton style={{ opacity: 0 }} disabled>
          <X size={22} color="transparent" />
        </IconButton>
      </HeaderBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <Body>
          <SearchField>
            <Search size={20} color={theme.colors.onSurfaceVariant} />
            <SearchInput
              placeholder="Search by email"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={input}
              onChangeText={setInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoFocus
            />
            {input.length > 0 ? (
              <IconButton onPress={() => setInput('')}>
                <XCircle size={18} color={theme.colors.onSurfaceVariant} />
              </IconButton>
            ) : null}
          </SearchField>

          {error ? (
            <ErrorBanner>
              <ErrorText>{(error as Error).message}</ErrorText>
            </ErrorBanner>
          ) : null}

          <Spacer size="sm" />

          {isEmpty ? (
            <StateMessage>
              <AtSign size={40} color={theme.colors.onSurfaceVariant} />
              <Spacer size="sm" />
              <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                Search for someone by their email address to send a friend request.
              </BodyMd>
            </StateMessage>
          ) : isTooShort ? (
            <StateMessage>
              <BodyMd style={{ color: theme.colors.onSurfaceVariant }}>
                Keep typing… we start searching at 3 characters.
              </BodyMd>
            </StateMessage>
          ) : isLoading ? (
            <StateMessage>
              <LoadingView />
            </StateMessage>
          ) : !hasResults ? (
            <StateMessage>
              <SearchX size={40} color={theme.colors.onSurfaceVariant} />
              <Spacer size="sm" />
              <BodyMd style={{ textAlign: 'center', color: theme.colors.onSurfaceVariant }}>
                No one matched &quot;{query}&quot;. Double-check the email spelling.
              </BodyMd>
            </StateMessage>
          ) : (
            <View>
              {results.map((row, idx) => {
                const isLast = idx === results.length - 1;
                const isSending = sendMutation.isPending && sendMutation.variables === row.user.id;
                const isAccepting =
                  (acceptMutation.isPending && acceptMutation.variables === row.requestId) ||
                  (row.requestId ? optimisticAcceptedIds.has(row.requestId) : false);

                let action: React.ReactNode;
                if (
                  row.state === 'pending-out' ||
                  isSending ||
                  optimisticPendingIds.has(row.user.id)
                ) {
                  action = (
                    <PillBase variant="muted" disabled activeOpacity={0.7}>
                      {isSending ? (
                        <ActivityIndicator size="small" color={theme.colors.onSurfaceVariant} />
                      ) : (
                        <PillText variant="muted">Pending</PillText>
                      )}
                    </PillBase>
                  );
                } else if (row.state === 'pending-in') {
                  action = (
                    <PillBase
                      variant="accept"
                      disabled={isAccepting}
                      activeOpacity={0.7}
                      onPress={() => row.requestId && handleAccept(row.requestId)}>
                      {isAccepting ? (
                        <ActivityIndicator size="small" color={theme.colors.brandDark} />
                      ) : (
                        <PillText variant="accept">Accept</PillText>
                      )}
                    </PillBase>
                  );
                } else {
                  action = (
                    <PillBase
                      variant="primary"
                      activeOpacity={0.85}
                      onPress={() => handleSend(row.user.id)}>
                      <PillText variant="primary">Add</PillText>
                    </PillBase>
                  );
                }

                return (
                  <TxnRow
                    key={row.user.id}
                    isLast={isLast}
                    onPress={() => {}}
                    leading={<Avatar name={row.user.name} imageUrl={row.user.avatarUrl} />}
                    title={<RowTitle numberOfLines={1}>{row.user.name}</RowTitle>}
                    subtitle={<RowSubtitle numberOfLines={1}>{row.user.email}</RowSubtitle>}
                    trailing={action}
                  />
                );
              })}
            </View>
          )}
        </Body>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default FriendSearchScreen;
