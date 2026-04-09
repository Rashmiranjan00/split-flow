import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialIcons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { 
  SafeScreen, 
  Content, 
  Row, 
  SpaceBetweenRow, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Title, 
  BodyMd, 
  BodySm, 
  Label,
  Headline
} from '@/shared/components/Typography';
import { ActionButton } from '@/shared/components/ActionButton';
import { useUser } from '@/shared/hooks/useUser';
import { useExpenseStore } from '@/features/expenses/store';
import { MOCK_GROUPS, MOCK_MEMBERS } from '@/shared/data/mockData';

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

const NavBar = styled(SpaceBetweenRow)`
  padding: ${Spacing.md}px ${Spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-bottom: 0;
`;

const NavBtn = styled.TouchableOpacity`
  padding: ${Spacing.xs}px ${Spacing.sm}px;
`;

const BigAmountContainer = styled.View`
  align-items: center;
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
`;

const BigInput = styled.TextInput`
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 56px;
  font-weight: 700;
  text-align: center;
  width: 100%;
  letter-spacing: -2px;
`;

const FieldSection = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.lg}px;
`;

interface ErrorProps {
  error?: boolean;
}

const TextInputStyled = styled.TextInput<ErrorProps>`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.md}px;
  padding: ${Spacing.md}px;
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 16px;
  border-width: 1px;
  border-color: ${({ error, theme }: ErrorProps & { theme: any }) => error ? theme.colors.error : theme.colors.outlineVariant};
`;

const ChipsRow = styled.ScrollView``;

interface SelectedProps {
  selected: boolean;
}

const Chip = styled.TouchableOpacity<SelectedProps>`
  padding-horizontal: ${Spacing.md}px;
  padding-vertical: ${Spacing.xs}px;
  border-radius: ${Radius.full}px;
  margin-right: ${Spacing.sm}px;
  background-color: ${({ selected, theme }: SelectedProps & { theme: any }) =>
    selected ? theme.colors.primaryContainer : theme.colors.surfaceContainerLow};
  border-width: 1px;
  border-color: ${({ selected, theme }: SelectedProps & { theme: any }) =>
    selected ? theme.colors.primary : theme.colors.outlineVariant};
`;

const ChipText = styled(BodySm)<SelectedProps>`
  color: ${({ selected, theme }: SelectedProps & { theme: any }) => selected ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-weight: ${({ selected }: SelectedProps) => selected ? '700' : '400'};
`;

const SplitTypeRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
`;

const SplitTypeBtn = styled.TouchableOpacity<SelectedProps>`
  flex: 1;
  padding-vertical: ${Spacing.sm}px;
  border-radius: ${Radius.md}px;
  align-items: center;
  background-color: ${({ selected, theme }: SelectedProps & { theme: any }) =>
    selected ? theme.colors.primaryContainer : theme.colors.surfaceContainerLow};
  border-width: 1px;
  border-color: ${({ selected, theme }: SelectedProps & { theme: any }) =>
    selected ? theme.colors.primary : theme.colors.outlineVariant};
`;

const SplitTypeBtnText = styled(Label)<SelectedProps>`
  color: ${({ selected, theme }: SelectedProps & { theme: any }) => selected ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-size: 11px;
  font-weight: ${({ selected }: SelectedProps) => selected ? '700' : '400'};
`;

const BottomActions = styled.View`
  padding: ${Spacing.lg}px;
  padding-bottom: ${Spacing.xl}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.colors.outlineVariant};
`;

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';

const AddExpenseScreen = () => {
  const router = useRouter();
  const { userId } = useUser();
  const addExpense = useExpenseStore(state => state.addExpense);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const theme = useTheme();

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
      paidBy: userId,
    },
  });

  const selectedGroupId = watch('groupId');
  const selectedGroup = MOCK_GROUPS.find(g => g.id === selectedGroupId);

  const onSubmit = (data: FormValues) => {
    const amountValue = parseFloat(data.amount);
    const members = selectedGroup?.members ?? [userId];
    const perPerson = amountValue / members.length;

    addExpense({
      id: `exp_${Date.now()}`,
      groupId: data.groupId,
      title: data.description,
      amount: amountValue,
      payerId: data.paidBy,
      date: new Date().toISOString(),
      splitType,
      splits: members.map(mid => ({ userId: mid, value: perPerson })),
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
    <SafeScreen>
      <NavBar>
        <NavBtn onPress={() => router.back()}>
          <BodyMd>Cancel</BodyMd>
        </NavBtn>
        <Title>New Expense</Title>
        <NavBtn onPress={handleSubmit(onSubmit)}>
          <BodyMd style={{ color: theme.colors.primary, fontWeight: '700' }}>Save</BodyMd>
        </NavBtn>
      </NavBar>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Content
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Big Amount Input */}
          <BigAmountContainer>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value, onBlur } }) => (
                <Row>
                  <Headline style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>$</Headline>
                  <BigInput
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.outlineVariant}
                    keyboardType="decimal-pad"
                    autoFocus
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </Row>
              )}
            />
            {errors.amount && <BodySm style={{ color: theme.colors.error }}>{errors.amount.message}</BodySm>}
          </BigAmountContainer>

          {/* Description */}
          <FieldSection>
            <Label style={{ marginBottom: Spacing.xs, textTransform: 'uppercase' }}>What's it for?</Label>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInputStyled
                  placeholder="e.g. Dinner, Uber, Airbnb..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.description}
                />
              )}
            />
            {errors.description && <BodySm style={{ color: theme.colors.error, marginTop: 4 }}>{errors.description.message}</BodySm>}
          </FieldSection>

          {/* Group Picker */}
          <FieldSection>
            <Label style={{ marginBottom: Spacing.xs, textTransform: 'uppercase' }}>Group / Vault</Label>
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
          </FieldSection>

          {/* Paid By */}
          <FieldSection>
            <Label style={{ marginBottom: Spacing.xs, textTransform: 'uppercase' }}>Paid by</Label>
            <Controller
              control={control}
              name="paidBy"
              render={({ field: { onChange, value } }) => (
                <ChipsRow horizontal showsHorizontalScrollIndicator={false}>
                  {(selectedGroup?.members ?? [userId]).map(mid => {
                    const member = MOCK_MEMBERS.find(m => m.id === mid);
                    const label = mid === userId ? 'You' : member?.name ?? mid;
                    return (
                      <Chip
                        key={mid}
                        selected={value === mid}
                        onPress={() => onChange(mid)}
                      >
                        <ChipText selected={value === mid}>{label}</ChipText>
                      </Chip>
                    );
                  })}
                </ChipsRow>
              )}
            />
          </FieldSection>

          {/* Split Type */}
          <FieldSection>
            <Label style={{ marginBottom: Spacing.xs, textTransform: 'uppercase' }}>Split method</Label>
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
        </Content>
      </KeyboardAvoidingView>

      <BottomActions>
        <ActionButton title="Add Expense" onPress={handleSubmit(onSubmit)} />
      </BottomActions>
    </SafeScreen>
  );
};

export default AddExpenseScreen;
