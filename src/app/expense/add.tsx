import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import { SafeScreen, SpaceBetweenRow, Spacer, SurfaceCard } from '@/shared/components/Layout';
import {
  BodyMd,
  SectionLabel,
  RowTitle,
  RowSubtitle,
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useAddExpenseForm } from '@/features/expenses/hooks/useAddExpenseForm';
import { ParticipantSelector } from '@/features/expenses/components/ParticipantSelector';
import { PaidBySelector } from '@/features/expenses/components/PaidBySelector';
import { CategorySelector } from '@/features/expenses/components/CategorySelector';
import { ReceiptUploader } from '@/features/expenses/components/ReceiptUploader';
import { EqualSplitEditor } from '@/features/expenses/components/split/EqualSplitEditor';
import { ExactSplitEditor } from '@/features/expenses/components/split/ExactSplitEditor';
import { PercentageSplitEditor } from '@/features/expenses/components/split/PercentageSplitEditor';
import { SharesSplitEditor } from '@/features/expenses/components/split/SharesSplitEditor';
import { SplitPreviewCard } from '@/features/expenses/components/SplitPreviewCard';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useGroups } from '@/features/groups/hooks/useGroups';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useUser } from '@/shared/hooks/useUser';
import { User } from '@/shared/types';

const Grabber = styled.View`
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.divider};
  align-self: center;
  margin-top: ${Spacing.sm}px;
  margin-bottom: ${Spacing.sm}px;
`;

const SheetHeader = styled(SpaceBetweenRow)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const HeaderButton = styled.TouchableOpacity`
  padding: ${Spacing.xs}px ${Spacing.sm}px;
`;

const CancelText = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const SaveText = styled.Text<{ disabled?: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.onSurfaceVariant : theme.colors.primary};
`;

const SheetTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const AmountHero = styled.View`
  align-items: center;
  padding: ${Spacing.xl}px ${Spacing.screenPadding}px ${Spacing.md}px;
`;

const AmountRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
`;

const CurrencySymbol = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 26px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-right: ${Spacing.xs}px;
  margin-top: 6px;
`;

const AmountInput = styled.TextInput`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 52px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -2px;
  text-align: center;
  min-width: 120px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const AmountUnderline = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin: 0 ${Spacing.screenPadding}px;
`;

const TitleInput = styled.TextInput`
  padding: 14px ${Spacing.screenPadding}px;
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const TitleUnderline = styled.View`
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin: 0 ${Spacing.screenPadding}px;
`;

const OptionRow = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14px ${Spacing.screenPadding}px;
`;

const OptionRowDivider = styled.View`
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-left: ${Spacing.screenPadding}px;
`;

const OptionLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const OptionValueText = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 14px;
  font-weight: ${TypographyTokens.weights.medium};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const OptionValueRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TealBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  padding: 4px 10px;
  border-radius: ${Radius.full}px;
`;

const TealBadgeText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.brandDark};
`;

const AvatarStackMini = styled.View`
  flex-direction: row;
  align-items: center;
  margin-right: ${Spacing.xs}px;
`;

const StackAvatar = styled.View<{ index: number }>`
  margin-left: ${(props: { index: number }) => (props.index === 0 ? 0 : -8)}px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
`;

const MoreOptionsButton = styled.TouchableOpacity`
  align-items: center;
  padding: ${Spacing.md}px;
`;

const MoreOptionsText = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 13px;
  font-weight: ${TypographyTokens.weights.medium};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const SPLIT_LABELS: Record<'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES', string> = {
  EQUAL: 'Equal',
  EXACT: 'Exact',
  PERCENTAGE: 'Percent',
  SHARES: 'Shares',
};

const SPLIT_METHODS: { key: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'; label: string }[] = [
  { key: 'EQUAL', label: 'Equal' },
  { key: 'EXACT', label: 'Exact' },
  { key: 'PERCENTAGE', label: 'Percent' },
  { key: 'SHARES', label: 'Shares' },
];

const AddExpenseScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { currencySymbol } = useCurrencyFormatter();
  const { userId, user } = useUser();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const { groups } = useGroups();
  const { friends: friendsList } = useFriends();

  const currentGroupId = groupId || (groups.length > 0 ? groups[0].id : '');
  const currentGroup = groups.find((g) => g.id === currentGroupId);

  /**
   * Resolve UserId[] (from the group) into User[] so child selectors that
   * expect full User objects (PaidBy / Participant / Split editors) receive
   * the correct shape. Any id with no matching friend/self becomes a
   * placeholder User with the id as name — prevents runtime crashes during
   * dev when mock data is sparse.
   */
  const groupMembers: User[] = React.useMemo(() => {
    if (!currentGroup) return [];
    return currentGroup.members.map<User>((memberId) => {
      if (memberId === userId && user) return user;
      const match = friendsList.find((f) => f.id === memberId);
      if (match) return match;
      return { id: memberId, name: memberId, email: '' };
    });
  }, [currentGroup, friendsList, user, userId]);

  const {
    form,
    handleSubmit,
    participants,
    splitType,
    splitDetails,
    setSplitType,
    updateSplitValues,
  } = useAddExpenseForm(currentGroupId);

  const { control, watch, setValue } = form;
  const amountStr = watch('amount');
  const category = watch('category') ?? 'Other';
  const paidBy = watch('paidBy');
  const amount = parseFloat(amountStr) || 0;
  const saveDisabled = amount <= 0;

  const [showMore, setShowMore] = React.useState(false);
  const [activeOption, setActiveOption] = React.useState<
    null | 'paidBy' | 'participants' | 'splitType' | 'category'
  >(null);

  const toggleParticipant = (id: string) => {
    const current = [...participants];
    if (current.includes(id)) {
      if (current.length > 1) setValue('participants', current.filter((pid) => pid !== id));
    } else {
      setValue('participants', [...current, id]);
    }
  };

  const paidByName = React.useMemo(() => {
    const m = groupMembers.find((mm) => mm.id === paidBy);
    return m?.id === userId ? 'You' : m?.name ?? 'You';
  }, [groupMembers, paidBy, userId]);

  const participantAvatars = React.useMemo(
    () => groupMembers.filter((m) => participants.includes(m.id)).slice(0, 3),
    [groupMembers, participants]
  );

  return (
    <SafeScreen edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Grabber />

        <SheetHeader>
          <HeaderButton onPress={() => router.back()}>
            <CancelText>Cancel</CancelText>
          </HeaderButton>
          <SheetTitle>New expense</SheetTitle>
          <HeaderButton onPress={handleSubmit} disabled={saveDisabled}>
            <SaveText disabled={saveDisabled}>Save</SaveText>
          </HeaderButton>
        </SheetHeader>

        <ScrollView showsVerticalScrollIndicator={false}>
          <AmountHero>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <AmountRow>
                  <CurrencySymbol>{currencySymbol}</CurrencySymbol>
                  <AmountInput
                    placeholder="0"
                    placeholderTextColor={theme.colors.onSurfaceVariant + '66'}
                    keyboardType="decimal-pad"
                    autoFocus
                    value={value}
                    onChangeText={onChange}
                  />
                </AmountRow>
              )}
            />
          </AmountHero>
          <AmountUnderline />

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TitleInput
                placeholder="What was it for?"
                placeholderTextColor={theme.colors.onSurfaceVariant + '99'}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <TitleUnderline />

          <Spacer size="sm" />

          {/* Option rows */}
          <OptionRow
            activeOpacity={0.6}
            onPress={() => setActiveOption((a) => (a === 'paidBy' ? null : 'paidBy'))}
          >
            <OptionLabel>Paid by</OptionLabel>
            <OptionValueRow>
              <OptionValueText>{paidByName}</OptionValueText>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ marginLeft: 4 }}
              />
            </OptionValueRow>
          </OptionRow>
          {activeOption === 'paidBy' && (
            <Controller
              control={control}
              name="paidBy"
              render={({ field: { value, onChange } }) => (
                <PaidBySelector members={groupMembers} selectedId={value} onSelect={onChange} />
              )}
            />
          )}
          <OptionRowDivider />

          <OptionRow
            activeOpacity={0.6}
            onPress={() =>
              setActiveOption((a) => (a === 'participants' ? null : 'participants'))
            }
          >
            <OptionLabel>Split with</OptionLabel>
            <OptionValueRow>
              <AvatarStackMini>
                {participantAvatars.map((m, i) => (
                  <StackAvatar key={m.id} index={i}>
                    <Avatar name={m.name} size={20} />
                  </StackAvatar>
                ))}
              </AvatarStackMini>
              <OptionValueText>{participants.length}</OptionValueText>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ marginLeft: 4 }}
              />
            </OptionValueRow>
          </OptionRow>
          {activeOption === 'participants' && (
            <ParticipantSelector
              members={groupMembers}
              selectedIds={participants}
              onToggle={toggleParticipant}
            />
          )}
          <OptionRowDivider />

          <OptionRow
            activeOpacity={0.6}
            onPress={() => setActiveOption((a) => (a === 'splitType' ? null : 'splitType'))}
          >
            <OptionLabel>Split type</OptionLabel>
            <OptionValueRow>
              <TealBadge>
                <TealBadgeText>{SPLIT_LABELS[splitType]}</TealBadgeText>
              </TealBadge>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ marginLeft: 4 }}
              />
            </OptionValueRow>
          </OptionRow>
          {activeOption === 'splitType' && (
            <View style={{ paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
                {SPLIT_METHODS.map((m) => {
                  const active = splitType === m.key;
                  return (
                    <View
                      key={m.key}
                      style={{
                        backgroundColor: active
                          ? theme.colors.primary
                          : theme.colors.surfaceContainerLow,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: Radius.full,
                      }}
                    >
                      <BodyMd
                        onPress={() => setSplitType(m.key)}
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                        }}
                      >
                        {m.label}
                      </BodyMd>
                    </View>
                  );
                })}
              </View>
              <Spacer size="sm" />
              {splitType === 'EQUAL' && (
                <EqualSplitEditor
                  participants={participants}
                  allMembers={groupMembers}
                  onToggle={toggleParticipant}
                  totalAmount={amount}
                />
              )}
              {splitType === 'EXACT' && (
                <ExactSplitEditor
                  participants={participants}
                  allMembers={groupMembers}
                  splitDetails={splitDetails}
                  onUpdate={updateSplitValues}
                  totalAmount={amount}
                />
              )}
              {splitType === 'PERCENTAGE' && (
                <PercentageSplitEditor
                  participants={participants}
                  allMembers={groupMembers}
                  splitDetails={splitDetails}
                  onUpdate={updateSplitValues}
                  totalAmount={amount}
                />
              )}
              {splitType === 'SHARES' && (
                <SharesSplitEditor
                  participants={participants}
                  allMembers={groupMembers}
                  splitDetails={splitDetails}
                  onUpdate={updateSplitValues}
                  totalAmount={amount}
                />
              )}
            </View>
          )}
          <OptionRowDivider />

          <OptionRow
            activeOpacity={0.6}
            onPress={() => setActiveOption((a) => (a === 'category' ? null : 'category'))}
          >
            <OptionLabel>Category</OptionLabel>
            <OptionValueRow>
              <OptionValueText>{category}</OptionValueText>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
                style={{ marginLeft: 4 }}
              />
            </OptionValueRow>
          </OptionRow>
          {activeOption === 'category' && (
            <View style={{ paddingTop: Spacing.sm, paddingBottom: Spacing.md }}>
              <Controller
                control={control}
                name="category"
                render={({ field: { value, onChange } }) => (
                  <CategorySelector selectedCategory={value || 'Other'} onSelect={onChange} />
                )}
              />
            </View>
          )}
          <OptionRowDivider />

          <Spacer size="md" />

          <MoreOptionsButton onPress={() => setShowMore((s) => !s)} activeOpacity={0.7}>
            <MoreOptionsText>{showMore ? 'Hide options' : 'More options'}</MoreOptionsText>
          </MoreOptionsButton>

          {showMore && (
            <View style={{ padding: Spacing.screenPadding }}>
              <SectionLabel>Receipt</SectionLabel>
              <Spacer size="sm" />
              <Controller
                control={control}
                name="receiptUri"
                render={({ field: { value, onChange } }) => (
                  <ReceiptUploader imageUri={value} onImageSelected={onChange} />
                )}
              />

              <Spacer size="xl" />

              <SectionLabel>Preview</SectionLabel>
              <Spacer size="sm" />
              <SurfaceCard>
                <SplitPreviewCard
                  paidBy={paidBy}
                  splitDetails={splitDetails}
                  allMembers={groupMembers}
                />
              </SurfaceCard>
            </View>
          )}

          <Spacer size="xxl" />
          <Spacer size="xxl" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AddExpenseScreen;
