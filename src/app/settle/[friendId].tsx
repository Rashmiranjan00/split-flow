import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, ArrowRight } from 'lucide-react-native';
import { Alert, View } from 'react-native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, Row, Spacer } from '@/shared/components/Layout';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useUser } from '@/shared/hooks/useUser';
import { useCreateSettlementMutation } from '@/features/settlements/hooks/useSettlementMutations';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useWebKeyboardShortcuts } from '@/shared/hooks/useWebKeyboardShortcuts';

type PaymentMethod = 'UPI' | 'Cash' | 'Bank';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const BackBtn = styled.TouchableOpacity`
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
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px;
  align-items: center;
`;

const AvatarRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: ${Spacing.lg}px;
  margin-bottom: ${Spacing.xl}px;
`;

const ArrowCircle = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  align-items: center;
  justify-content: center;
  margin: 0 ${Spacing.md}px;
`;

const FriendName = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const OweLine = styled.Text`
  margin-top: 4px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const Amount = styled.Text`
  margin-top: ${Spacing.lg}px;
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 40px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.danger};
  letter-spacing: -1px;
`;

const PaymentMethods = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  margin-top: ${Spacing.xl}px;
`;

const MethodPill = styled.TouchableOpacity<{ active: boolean }>`
  padding: 10px 20px;
  border-radius: ${Radius.full}px;
  border-width: 1px;
  border-color: ${({ active, theme }: { active: boolean; theme: any }) =>
    active ? theme.colors.primary : theme.colors.divider};
  background-color: ${({ active, theme }: { active: boolean; theme: any }) =>
    active ? theme.colors.primary : 'transparent'};
`;

const MethodText = styled.Text<{ active: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 14px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ active, theme }: { active: boolean; theme: any }) =>
    active ? theme.colors.onPrimary : theme.colors.primary};
`;

const BottomCTA = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.xl}px;
`;

const SettleScreen = () => {
  const { friendId, groupId, amount } = useLocalSearchParams<{
    friendId: string;
    groupId?: string;
    amount?: string;
  }>();
  const { friends } = useFriends();
  const { user, userId } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const { formatCurrency } = useCurrencyFormatter();
  const settleMutation = useCreateSettlementMutation();

  const friend = friends.find((m) => m.id === friendId);
  const [method, setMethod] = React.useState<PaymentMethod>('UPI');
  const owedAmount = parseFloat(amount ?? '0') || 0;

  useWebKeyboardShortcuts([{ key: 'Escape', handler: () => router.back() }]);

  const handleSettle = async () => {
    if (!groupId || owedAmount <= 0) {
      Alert.alert('Cannot settle', 'No outstanding balance to settle.');
      return;
    }

    try {
      await settleMutation.mutateAsync({
        groupId,
        fromUser: userId,
        toUser: friendId ?? '',
        amount: owedAmount,
      });
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Settlement failed';
      Alert.alert('Error', message);
    }
  };

  return (
    <SafeScreen>
      <HeaderBar>
        <BackBtn onPress={() => router.back()}>
          <X size={22} color={theme.colors.onSurface} />
        </BackBtn>
        <HeaderTitle>Settle up</HeaderTitle>
        <View style={{ width: 36 }} />
      </HeaderBar>

      <Body>
        <AvatarRow>
          <Avatar name={user?.name ?? 'You'} size={Spacing.avatarLg} />
          <ArrowCircle>
            <ArrowRight size={18} color={theme.colors.brandDark} />
          </ArrowCircle>
          <Avatar name={friend?.name ?? 'Friend'} size={Spacing.avatarLg} />
        </AvatarRow>

        <FriendName>{friend?.name ?? 'Friend'}</FriendName>
        <OweLine>You owe {friend?.name ?? 'them'}</OweLine>
        <Amount>{formatCurrency(owedAmount)}</Amount>

        <PaymentMethods>
          {(['UPI', 'Cash', 'Bank'] as PaymentMethod[]).map((m) => {
            const active = method === m;
            return (
              <MethodPill key={m} active={active} activeOpacity={0.7} onPress={() => setMethod(m)}>
                <MethodText active={active}>{m}</MethodText>
              </MethodPill>
            );
          })}
        </PaymentMethods>

        <Spacer size="xxl" />
      </Body>

      <BottomCTA>
        <ActionButton
          title="Mark as Settled"
          onPress={handleSettle}
          isLoading={settleMutation.isPending}
          disabled={owedAmount <= 0}
        />
      </BottomCTA>
    </SafeScreen>
  );
};

export default SettleScreen;
