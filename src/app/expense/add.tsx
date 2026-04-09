import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert, ScrollView, View } from 'react-native';
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
  Display,
  Headline
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { useUser } from '@/shared/hooks/useUser';
import { useExpenseStore } from '@/features/expenses/store';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { useCurrencyStore } from '@/shared/hooks/useCurrencyStore';
import { MOCK_GROUPS, MOCK_MEMBERS } from '@/shared/data/mockData';

const schema = z.object({
  description: z.string().min(1, 'Description is required').max(80, 'Too long'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Enter a valid amount'),
  groupId: z.string().min(1, 'Select a group'),
  paidBy: z.string().min(1, 'Select who paid'),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const HeaderSection = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  padding-bottom: ${Spacing.lg}px;
`;

const LuxeNavBar = styled(SpaceBetweenRow)`
  padding: ${Spacing.md}px ${Spacing.lg}px;
  height: 64px;
`;

const NavIconButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: ${Radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
`;

const SaveButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.primary};
  padding: ${Spacing.sm}px ${Spacing.lg}px;
  border-radius: ${Radius.full}px;
`;

const SaveButtonText = styled(Label)`
  color: ${({ theme }) => theme.colors.onPrimary};
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const AmountInputContainer = styled.View`
  align-items: center;
  padding: ${Spacing.xl}px ${Spacing.lg}px;
`;

const AmountRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const CurrencySymbol = styled(Display)`
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  font-size: 32px;
  margin-right: ${Spacing.sm}px;
  opacity: 0.6;
`;

const AmountInput = styled.TextInput`
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -2px;
  text-align: center;
  min-width: 150px;
`;

const FormBody = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-top-left-radius: ${Radius.xl} * 2px;
  border-top-right-radius: ${Radius.xl} * 2px;
  padding-top: ${Spacing.xl}px;
`;

const SectionLabel = styled(Label)`
  margin-horizontal: ${Spacing.xl}px;
  margin-bottom: ${Spacing.sm}px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  letter-spacing: 1.2px;
  text-transform: uppercase;
  font-size: 10px;
  opacity: 0.7;
`;

const SelectionCard = styled.TouchableOpacity`
  margin-horizontal: ${Spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

const GhostGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding-horizontal: ${Spacing.lg}px;
  gap: ${Spacing.sm}px;
`;

interface GridCardProps {
  selected: boolean;
}

const GridCard = styled.TouchableOpacity<GridCardProps>`
  width: 23%;
  aspect-ratio: 1;
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryContainer : theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.md}px;
  align-items: center;
  justify-content: center;
  border-width: 0.5px;
  border-color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : `${theme.colors.outlineVariant}66`};
`;

const GridCardText = styled(Label)<GridCardProps>`
  margin-top: ${Spacing.xs}px;
  font-size: 9px;
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-weight: ${({ selected }) => selected ? '700' : '400'};
`;

const DescriptionInput = styled.TextInput`
  margin-horizontal: ${Spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: ${Radius.full}px;
  padding: ${Spacing.md}px ${Spacing.xl}px;
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 16px;
`;

const AvatarStack = styled.View`
  flex-direction: row;
  align-items: center;
`;

const AvatarOverlap = styled.View<{ index: number }>`
  margin-left: ${({ index }) => (index === 0 ? 0 : -12)}px;
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.full}px;
`;

const PlusCircle = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: ${Radius.full}px;
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  align-items: center;
  justify-content: center;
  margin-left: ${Spacing.sm}px;
`;

type SplitType = 'EQUAL' | 'EXACT' | 'SHARES' | 'ADJUST';

const CATEGORIES = [
  { id: 'dining', label: 'DINING', icon: 'restaurant' as const },
  { id: 'shopping', label: 'SHOPPING', icon: 'shopping-bag' as const },
  { id: 'travel', label: 'TRAVEL', icon: 'flight' as const },
  { id: 'home', label: 'HOME', icon: 'home' as const },
  { id: 'fun', label: 'FUN', icon: 'confirmation-number' as const },
  { id: 'other', label: 'OTHER', icon: 'more-horiz' as const },
];

const SPLIT_METHODS: { key: SplitType; label: string; icon: string }[] = [
  { key: 'EQUAL', label: 'EQUAL', icon: 'equalizer' },
  { key: 'EXACT', label: 'EXACT', icon: 'pin' },
  { key: 'SHARES', label: 'SHARES', icon: 'pie-chart' },
  { key: 'ADJUST', label: 'ADJUST', icon: 'adjust' },
];

const AddExpenseScreen = () => {
  const router = useRouter();
  const { userId } = useUser();
  const addExpense = useExpenseStore(state => state.addExpense);
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const theme = useTheme();
  const activeCurrency = useCurrencyStore(state => state.currency);
  const { currencySymbol, formatCurrency } = useCurrencyFormatter();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: '',
      amount: '',
      groupId: MOCK_GROUPS[0]?.id ?? '',
      paidBy: userId,
      category: 'dining',
    },
  });

  const selectedGroupId = watch('groupId');
  const selectedCategory = watch('category');
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
      splitType: (splitType === 'ADJUST' ? 'PERCENTAGE' : splitType) as any,
      splits: members.map(mid => ({ userId: mid, value: perPerson })),
      category: CATEGORIES.find(c => c.id === data.category)?.label ?? 'Other',
    });

    Alert.alert('Expense Added', `"${data.description}" has been added!`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <HeaderSection>
          <LuxeNavBar>
            <NavIconButton onPress={() => router.back()}>
              <MaterialIcons name="close" size={20} color={theme.colors.onSurface} />
            </NavIconButton>
            <Title style={{ letterSpacing: -0.5 }}>SplitFlow</Title>
            <SaveButton onPress={handleSubmit(onSubmit)}>
              <SaveButtonText>Save Expense</SaveButtonText>
            </SaveButton>
          </LuxeNavBar>

          <AmountInputContainer>
            <SectionLabel style={{ marginHorizontal: 0, marginBottom: 0 }}>Amount to split</SectionLabel>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value, onBlur } }) => (
                <AmountRow>
                  <CurrencySymbol>{currencySymbol}</CurrencySymbol>
                  <AmountInput
                    placeholder="0.00"
                    placeholderTextColor={`${theme.colors.onSurfaceVariant}44`}
                    keyboardType="decimal-pad"
                    autoFocus
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <MaterialIcons name="unfold-more" size={24} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.3 }} />
                </AmountRow>
              )}
            />
          </AmountInputContainer>

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <DescriptionInput
                placeholder="What was this for?"
                placeholderTextColor={`${theme.colors.onSurfaceVariant}77`}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </HeaderSection>

        <FormBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <SectionLabel>Paid By</SectionLabel>
            <SelectionCard activeOpacity={0.7} onPress={() => Alert.alert('Select Payer', 'Feature coming soon')}>
              <Avatar name="You" size={40} />
              <Spacer size="md" horizontal />
              <View style={{ flex: 1 }}>
                <BodyMd style={{ fontWeight: '600' }}>You</BodyMd>
                <BodySm style={{ opacity: 0.6 }}>Account Balance: $1,240</BodySm>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.onSurfaceVariant} />
            </SelectionCard>

            <Spacer size="lg" />

            <SectionLabel>Split With</SectionLabel>
            <Row style={{ marginHorizontal: Spacing.xl }}>
              <AvatarStack>
                {MOCK_MEMBERS.slice(1, 4).map((m, i) => (
                  <AvatarOverlap key={m.id} index={i}>
                    <Avatar name={m.name} size={32} />
                  </AvatarOverlap>
                ))}
              </AvatarStack>
              <PlusCircle>
                <MaterialIcons name="person-add" size={16} color={theme.colors.primary} />
              </PlusCircle>
            </Row>

            <Spacer size="xl" />

            <SpaceBetweenRow style={{ marginHorizontal: Spacing.xl, marginBottom: Spacing.sm }}>
              <Label style={{ fontSize: 10, letterSpacing: 1.2 }}>Split Method</Label>
              <Label style={{ color: theme.colors.primary, fontSize: 10 }}>Equally divided</Label>
            </SpaceBetweenRow>
            
            <GhostGrid>
              {SPLIT_METHODS.map(method => (
                <GridCard 
                  key={method.key} 
                  selected={splitType === method.key}
                  onPress={() => setSplitType(method.key)}
                >
                  <MaterialIcons 
                    name={method.icon as any} 
                    size={20} 
                    color={splitType === method.key ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <GridCardText selected={splitType === method.key}>{method.label}</GridCardText>
                </GridCard>
              ))}
            </GhostGrid>

            <Spacer size="xl" />

            <SectionLabel>Category</SectionLabel>
            <GhostGrid>
              {CATEGORIES.map(cat => (
                <GridCard 
                  key={cat.id}
                  selected={selectedCategory === cat.id}
                  onPress={() => setValue('category', cat.id)}
                >
                  <MaterialIcons 
                    name={cat.icon as any} 
                    size={20} 
                    color={selectedCategory === cat.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <GridCardText selected={selectedCategory === cat.id}>{cat.label}</GridCardText>
                </GridCard>
              ))}
            </GhostGrid>

            <Spacer size="xl" />

            <Row style={{ marginHorizontal: Spacing.lg, gap: Spacing.sm }}>
              <ActionButton 
                title="Add Receipt" 
                variant="secondary" 
                style={{ flex: 1, height: 48 }} 
                icon="camera-alt"
                onPress={() => Alert.alert('Add Receipt', 'Camera feature coming soon')}
              />
              <ActionButton 
                title="Add Note" 
                variant="secondary" 
                style={{ flex: 1, height: 48 }} 
                icon="notes"
                onPress={() => Alert.alert('Add Note', 'Notes feature coming soon')}
              />
            </Row>

            <Spacer size="xxxl" />
          </ScrollView>
        </FormBody>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AddExpenseScreen;
