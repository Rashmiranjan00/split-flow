import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { MOCK_GROUPS, MOCK_MEMBERS } from '@/data/mockData';
import { useExpenseStore } from '@/features/expenses/store';

const schema = z.object({
  description: z.string().min(1, 'Description is required').max(80, 'Too long'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  groupId: z.string().min(1, 'Select a group'),
  paidBy: z.string().min(1, 'Select who paid'),
});

type FormValues = z.infer<typeof schema>;

// ── Styled components ─────────────────────────────────────────────
const Wrapper = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.surface};
`;

const NavBar = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${Spacing.md}px ${Spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

const NavTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const NavBtn = styled.TouchableOpacity`
  padding: ${Spacing.xs}px ${Spacing.sm}px;
`;

const NavBtnText = styled.Text<{ primary?: boolean }>`
  color: ${({ primary }: { primary?: boolean }) => primary ? Colors.primary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${({ primary }: { primary?: boolean }) => primary ? '700' : '400'};
`;

const BigAmountContainer = styled.View`
  align-items: center;
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
`;

const CurrencySymbol = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  position: absolute;
  left: ${Spacing.lg + 10}px;
  top: ${Spacing.xxl + 4}px;
`;

const BigInput = styled.TextInput`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  text-align: center;
  width: 100%;
  letter-spacing: -2px;
`;

const ErrorHint = styled.Text`
  color: ${Colors.error};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-align: center;
  margin-top: ${Spacing.xs}px;
`;

const FieldSection = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.lg}px;
`;

const FieldLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${Spacing.xs}px;
`;

const TextInputStyled = styled.TextInput`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.md}px;
  padding: ${Spacing.md}px;
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const TextInputError = styled(TextInputStyled)`
  border-color: ${Colors.error};
`;

const ChipsRow = styled.ScrollView``;

const Chip = styled.TouchableOpacity<{ selected: boolean }>`
  padding-horizontal: ${Spacing.md}px;
  padding-vertical: ${Spacing.xs}px;
  border-radius: ${Radius.full}px;
  margin-right: ${Spacing.sm}px;
  background-color: ${({ selected }: { selected: boolean }) =>
    selected ? Colors.primaryContainer : Colors.surfaceContainerLow};
  border-width: 1px;
  border-color: ${({ selected }: { selected: boolean }) =>
    selected ? Colors.primary : Colors.outlineVariant};
`;

const ChipText = styled.Text<{ selected: boolean }>`
  color: ${({ selected }: { selected: boolean }) => selected ? Colors.primary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${({ selected }: { selected: boolean }) => selected ? '700' : '400'};
`;

const SplitTypeRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
`;

const SplitTypeBtn = styled.TouchableOpacity<{ selected: boolean }>`
  flex: 1;
  padding-vertical: ${Spacing.sm}px;
  border-radius: ${Radius.md}px;
  align-items: center;
  background-color: ${({ selected }: { selected: boolean }) =>
    selected ? Colors.primaryContainer : Colors.surfaceContainerLow};
  border-width: 1px;
  border-color: ${({ selected }: { selected: boolean }) =>
    selected ? Colors.primary : Colors.outlineVariant};
`;

const SplitTypeBtnText = styled.Text<{ selected: boolean }>`
  color: ${({ selected }: { selected: boolean }) => selected ? Colors.primary : Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: 11px;
  font-weight: ${({ selected }: { selected: boolean }) => selected ? '700' : '400'};
`;

const BottomActions = styled.View`
  padding: ${Spacing.lg}px;
  padding-bottom: ${Spacing.xl}px;
  border-top-width: 1px;
  border-top-color: ${Colors.outlineVariant};
`;

const PrimaryButton = styled.TouchableOpacity`
  background-color: ${Colors.primary};
  border-radius: ${Radius.full}px;
  padding-vertical: ${Spacing.md}px;
  align-items: center;
`;

const PrimaryButtonText = styled.Text`
  color: ${Colors.onPrimaryFixed};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.bold};
`;

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

export default function AddExpenseScreen() {
  const router = useRouter();
  const addExpense = useExpenseStore(state => state.addExpense);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      groupId: MOCK_GROUPS[0]?.id ?? '',
      paidBy: 'usr_1',
    },
  });

  const selectedGroupId = watch('groupId');
  const selectedGroup = MOCK_GROUPS.find(g => g.id === selectedGroupId);

  const onSubmit = (data: FormValues) => {
    const amount = parseFloat(data.amount);
    const members = selectedGroup?.members ?? ['usr_1'];
    const perPerson = amount / members.length;

    addExpense({
      id: `exp_${Date.now()}`,
      groupId: data.groupId,
      title: data.description,
      amount,
      payerId: data.paidBy,
      date: new Date().toISOString(),
      splitType,
      splits: members.map(userId => ({ userId, value: perPerson })),
    });

    Alert.alert('Expense Added', `"${data.description}" has been added!`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const splitTypes: { key: SplitType; label: string }[] = [
    { key: 'EQUAL', label: '= Equal' },
    { key: 'EXACT', label: '$ Exact' },
    { key: 'PERCENTAGE', label: '% Percent' },
    { key: 'SHARES', label: '÷ Shares' },
  ];

  return (
    <Wrapper edges={['top']}>
      <NavBar>
        <NavBtn onPress={() => router.back()}>
          <NavBtnText>Cancel</NavBtnText>
        </NavBtn>
        <NavTitle>New Expense</NavTitle>
        <NavBtn onPress={handleSubmit(onSubmit)}>
          <NavBtnText primary>Save</NavBtnText>
        </NavBtn>
      </NavBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Big Amount Input */}
          <BigAmountContainer>
            <CurrencySymbol>$</CurrencySymbol>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value, onBlur } }) => (
                <BigInput
                  placeholder="0.00"
                  placeholderTextColor={Colors.outlineVariant}
                  keyboardType="decimal-pad"
                  autoFocus
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.amount && <ErrorHint>{errors.amount.message}</ErrorHint>}
          </BigAmountContainer>

          {/* Description */}
          <FieldSection>
            <FieldLabel>What's it for?</FieldLabel>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value, onBlur } }) =>
                errors.description ? (
                  <TextInputError
                    placeholder="e.g. Dinner, Uber, Airbnb..."
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                ) : (
                  <TextInputStyled
                    placeholder="e.g. Dinner, Uber, Airbnb..."
                    placeholderTextColor={Colors.onSurfaceVariant}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )
              }
            />
            {errors.description && <ErrorHint>{errors.description.message}</ErrorHint>}
          </FieldSection>

          {/* Group Picker */}
          <FieldSection>
            <FieldLabel>Group / Vault</FieldLabel>
            <Controller
              control={control}
              name="groupId"
              render={({ field: { onChange, value } }) => (
                <ChipsRow
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {MOCK_GROUPS.map(group => (
                    <Chip
                      key={group.id}
                      selected={value === group.id}
                      onPress={() => onChange(group.id)}
                    >
                      <ChipText selected={value === group.id}>{group.name}</ChipText>
                    </Chip>
                  ))}
                </ChipsRow>
              )}
            />
            {errors.groupId && <ErrorHint>{errors.groupId.message}</ErrorHint>}
          </FieldSection>

          {/* Paid By */}
          <FieldSection>
            <FieldLabel>Paid by</FieldLabel>
            <Controller
              control={control}
              name="paidBy"
              render={({ field: { onChange, value } }) => (
                <ChipsRow horizontal showsHorizontalScrollIndicator={false}>
                  {(selectedGroup?.members ?? ['usr_1']).map(userId => {
                    const member = MOCK_MEMBERS.find(m => m.id === userId);
                    const label = userId === 'usr_1' ? 'You' : member?.name ?? userId;
                    return (
                      <Chip
                        key={userId}
                        selected={value === userId}
                        onPress={() => onChange(userId)}
                      >
                        <ChipText selected={value === userId}>{label}</ChipText>
                      </Chip>
                    );
                  })}
                </ChipsRow>
              )}
            />
          </FieldSection>

          {/* Split Type */}
          <FieldSection>
            <FieldLabel>Split method</FieldLabel>
            <SplitTypeRow>
              {splitTypes.map(st => (
                <SplitTypeBtn
                  key={st.key}
                  selected={splitType === st.key}
                  onPress={() => setSplitType(st.key)}
                >
                  <SplitTypeBtnText selected={splitType === st.key}>{st.label}</SplitTypeBtnText>
                </SplitTypeBtn>
              ))}
            </SplitTypeRow>
          </FieldSection>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActions>
        <PrimaryButton onPress={handleSubmit(onSubmit)} activeOpacity={0.85}>
          <PrimaryButtonText>Add Expense</PrimaryButtonText>
        </PrimaryButton>
      </BottomActions>
    </Wrapper>
  );
}
