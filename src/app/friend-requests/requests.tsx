import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, View } from 'react-native';
import { X, Inbox } from 'lucide-react-native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  SafeScreen,
  Content,
  Row,
  SectionHeader,
  Spacer,
  TxnRow,
} from '@/shared/components/Layout';
import { BodyMd, RowSubtitle, RowTitle } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useFriendRequests } from '@/features/friends/hooks/useFriendRequests';
import {
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from '@/features/friends/hooks/useFriendMutations';
import type { FriendRequestWithProfile } from '@/shared/types';
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

const ActionRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.xs}px;
  align-items: center;
`;

const Pill = styled.TouchableOpacity<{ variant: 'accept' | 'reject' | 'muted' }>`
  padding: 8px 14px;
  border-radius: ${Radius.full}px;
  border-width: ${({ variant }: { variant: 'accept' | 'reject' | 'muted' }) =>
    variant !== 'accept' ? 1 : 0}px;
  border-color: ${({ theme, variant }: { theme: any; variant: 'accept' | 'reject' | 'muted' }) =>
    variant === 'reject' ? theme.colors.dangerLight : theme.colors.outlineVariant};
  background-color: ${({
    theme,
    variant,
  }: {
    theme: any;
    variant: 'accept' | 'reject' | 'muted';
  }) => {
    if (variant === 'accept') return theme.colors.primary;
    return 'transparent';
  }};
`;

const PillText = styled.Text<{ variant: 'accept' | 'reject' | 'muted' }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, variant }: { theme: any; variant: 'accept' | 'reject' | 'muted' }) => {
    if (variant === 'accept') return theme.colors.onPrimary;
    if (variant === 'reject') return theme.colors.danger;
    return theme.colors.onSurfaceVariant;
  }};
`;

const EmptySection = styled.View`
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
  align-items: center;
`;

interface RequestRowProps {
  request: FriendRequestWithProfile;
  direction: 'incoming' | 'outgoing';
  isLast?: boolean;
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  pendingAcceptId?: string;
  pendingRejectId?: string;
  optimisticAcceptedIds?: Set<string>;
  optimisticRejectedIds?: Set<string>;
}

const RequestRow: React.FC<RequestRowProps> = ({
  request,
  direction,
  isLast,
  onAccept,
  onReject,
  pendingAcceptId,
  pendingRejectId,
  optimisticAcceptedIds,
  optimisticRejectedIds,
}) => {
  const theme = useTheme();
  const isAccepting = pendingAcceptId === request.id || (optimisticAcceptedIds?.has(request.id) ?? false);
  const isRejecting = pendingRejectId === request.id || (optimisticRejectedIds?.has(request.id) ?? false);

  return (
    <TxnRow
      isLast={isLast}
      onPress={() => {}}
      leading={<Avatar name={request.profile.name} imageUrl={request.profile.avatarUrl} />}
      title={<RowTitle numberOfLines={1}>{request.profile.name}</RowTitle>}
      subtitle={<RowSubtitle numberOfLines={1}>{request.profile.email}</RowSubtitle>}
      trailing={
        direction === 'incoming' ? (
          <ActionRow>
            <Pill
              variant="reject"
              activeOpacity={0.7}
              disabled={isAccepting || isRejecting}
              onPress={() => onReject?.(request.id)}>
              {isRejecting ? (
                <ActivityIndicator size="small" color={theme.colors.danger} />
              ) : (
                <PillText variant="reject">Reject</PillText>
              )}
            </Pill>
            <Pill
              variant="accept"
              activeOpacity={0.85}
              disabled={isAccepting || isRejecting}
              onPress={() => onAccept?.(request.id)}>
              {isAccepting ? (
                <ActivityIndicator size="small" color={theme.colors.onPrimary} />
              ) : (
                <PillText variant="accept">Accept</PillText>
              )}
            </Pill>
          </ActionRow>
        ) : (
          <Pill
            variant="muted"
            activeOpacity={0.7}
            disabled={isRejecting}
            onPress={() => onReject?.(request.id)}>
            {isRejecting ? (
              <ActivityIndicator size="small" color={theme.colors.onSurfaceVariant} />
            ) : (
              <PillText variant="muted">Pending · Cancel</PillText>
            )}
          </Pill>
        )
      }
    />
  );
};

const FriendRequestsScreen = () => {
  const router = useRouter();
  const theme = useTheme();

  const { incoming, outgoing, isLoading, error } = useFriendRequests();
  const acceptMutation = useAcceptFriendRequestMutation();
  const rejectMutation = useRejectFriendRequestMutation();
  const [optimisticAcceptedIds, setOptimisticAcceptedIds] = useState<Set<string>>(new Set());
  const [optimisticRejectedIds, setOptimisticRejectedIds] = useState<Set<string>>(new Set());

  const handleAccept = (id: string) => {
    setOptimisticAcceptedIds((prev) => new Set(prev).add(id));
    acceptMutation.mutate(id, {
      onError: (err: unknown) => {
        setOptimisticAcceptedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        const message = err instanceof Error ? err.message : 'Failed to accept';
        Alert.alert('Could not accept request', message);
      },
    });
  };

  const handleReject = (id: string) => {
    setOptimisticRejectedIds((prev) => new Set(prev).add(id));
    rejectMutation.mutate(id, {
      onError: (err: unknown) => {
        setOptimisticRejectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        const message = err instanceof Error ? err.message : 'Failed to reject';
        Alert.alert('Could not reject request', message);
      },
    });
  };

  const totalCount = incoming.length + outgoing.length;

  return (
    <SafeScreen>
      <HeaderBar>
        <IconButton onPress={() => router.back()}>
          <X size={22} color={theme.colors.onSurface} />
        </IconButton>
        <HeaderTitle>Friend Requests</HeaderTitle>
        <IconButton style={{ opacity: 0 }} disabled>
          <X size={22} color="transparent" />
        </IconButton>
      </HeaderBar>

      <Content showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <LoadingView message="Loading requests..." />
        ) : error ? (
          <EmptySection>
            <BodyMd style={{ color: theme.colors.danger, textAlign: 'center' }}>
              {(error as Error).message}
            </BodyMd>
          </EmptySection>
        ) : totalCount === 0 ? (
          <EmptySection>
            <Inbox size={40} color={theme.colors.onSurfaceVariant} />
            <Spacer size="sm" />
            <BodyMd style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              No pending friend requests.
            </BodyMd>
          </EmptySection>
        ) : (
          <View>
            {incoming.length > 0 ? (
              <>
                <SectionHeader label={`Incoming · ${incoming.length}`} />
                {incoming.map((req, idx) => (
                  <RequestRow
                    key={req.id}
                    request={req}
                    direction="incoming"
                    isLast={idx === incoming.length - 1}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    pendingAcceptId={
                      acceptMutation.isPending ? (acceptMutation.variables as string) : undefined
                    }
                    pendingRejectId={
                      rejectMutation.isPending ? (rejectMutation.variables as string) : undefined
                    }
                    optimisticAcceptedIds={optimisticAcceptedIds}
                    optimisticRejectedIds={optimisticRejectedIds}
                  />
                ))}
              </>
            ) : null}

            {outgoing.length > 0 ? (
              <>
                <SectionHeader label={`Sent · ${outgoing.length}`} />
                {outgoing.map((req, idx) => (
                  <RequestRow
                    key={req.id}
                    request={req}
                    direction="outgoing"
                    isLast={idx === outgoing.length - 1}
                    onReject={handleReject}
                    pendingRejectId={
                      rejectMutation.isPending ? (rejectMutation.variables as string) : undefined
                    }
                    optimisticRejectedIds={optimisticRejectedIds}
                  />
                ))}
              </>
            ) : null}
          </View>
        )}

        <View style={{ height: Spacing.xxxl }} />
      </Content>
    </SafeScreen>
  );
};

export default FriendRequestsScreen;
