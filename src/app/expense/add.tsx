import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Controller } from 'react-hook-form';
import { MaterialIcons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { 
  SafeScreen, 
  Spacer,
  Row,
  SpaceBetweenRow
} from '@/shared/components/Layout';
import { 
  Title, 
  BodyMd, 
  Label,
  Display,
} from '@/shared/components/Typography';
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
import { useCurrencyStore } from '@/shared/hooks/useCurrencyStore';
import { MOCK_GROUPS, MOCK_MEMBERS } from '@/shared/data/mockData';
import { useGroupStore } from '@/features/groups/store';

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

const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ theme, disabled }) => 
    disabled ? theme.colors.surfaceContainerHighest : theme.colors.primary};
  padding: ${Spacing.sm}px ${Spacing.lg}px;
  border-radius: ${Radius.full}px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
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
  border-top-left-radius: ${Radius.xl * 2}px;
  border-top-right-radius: ${Radius.xl * 2}px;
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

const TitleInput = styled.TextInput`
  margin-horizontal: ${Spacing.lg}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerHighest};
  border-radius: ${Radius.full}px;
  padding: ${Spacing.md}px ${Spacing.xl}px;
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 16px;
`;

const SplitGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding-horizontal: ${Spacing.lg}px;
  gap: ${Spacing.sm}px;
  margin-bottom: ${Spacing.lg}px;
`;

const SplitCard = styled.TouchableOpacity<{ selected: boolean }>`
  width: 23%;
  aspect-ratio: 1;
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryContainer : theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.md}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : 'transparent'};
`;

const SPLIT_METHODS: { key: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES'; label: string; icon: string }[] = [
  { key: 'EQUAL', label: 'EQUAL', icon: 'equalizer' },
  { key: 'EXACT', label: 'EXACT', icon: 'pin' },
  { key: 'PERCENTAGE', label: 'PERCENT', icon: 'pie-chart' },
  { key: 'SHARES', label: 'SHARES', icon: 'reorder' },
];

const AddExpenseScreen = () => {
  const router = useRouter();
  const theme = useTheme();
  const { currencySymbol } = useCurrencyFormatter();
  const { groupId = 'group_1' } = useLocalSearchParams<{ groupId: string }>();
  
  // Try to find the group in store
  const groups = useGroupStore(state => state.groups);
  const currentGroupId = groupId || (groups.length > 0 ? groups[0].id : '');
  const currentGroup = groups.find(g => g.id === currentGroupId);
  
  // Get all members for selection
  const groupMembers = currentGroup ? currentGroup.members : [];

  const {
    form,
    handleSubmit,
    participants,
    splitType,
    splitDetails,
    setSplitType,
    updateSplitValues,
  } = useAddExpenseForm(currentGroupId);

  const { control, watch, setValue, formState: { errors } } = form;
  const amountStr = watch('amount');
  const amount = parseFloat(amountStr) || 0;

  const toggleParticipant = (id: string) => {
    const current = [...participants];
    if (current.includes(id)) {
      if (current.length > 1) {
        setValue('participants', current.filter(pid => pid !== id));
      }
    } else {
      setValue('participants', [...current, id]);
    }
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
            <Title style={{ letterSpacing: -0.5 }}>New Expense</Title>
            <SaveButton onPress={handleSubmit}>
              <SaveButtonText>Save</SaveButtonText>
            </SaveButton>
          </LuxeNavBar>

          <AmountInputContainer>
            <SectionLabel style={{ marginHorizontal: 0, marginBottom: 0 }}>Amount</SectionLabel>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <AmountRow>
                  <CurrencySymbol>{currencySymbol}</CurrencySymbol>
                  <AmountInput
                    placeholder="0.00"
                    placeholderTextColor={`${theme.colors.onSurfaceVariant}44`}
                    keyboardType="decimal-pad"
                    autoFocus
                    value={value}
                    onChangeText={onChange}
                  />
                </AmountRow>
              )}
            />
          </AmountInputContainer>

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TitleInput
                placeholder="What was this for?"
                placeholderTextColor={`${theme.colors.onSurfaceVariant}77`}
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </HeaderSection>

        <FormBody>
          <ScrollView showsVerticalScrollIndicator={false}>
            <SectionLabel>Paid By</SectionLabel>
            <Controller
              control={control}
              name="paidBy"
              render={({ field: { value, onChange } }) => (
                <PaidBySelector 
                  members={groupMembers} 
                  selectedId={value} 
                  onSelect={onChange} 
                />
              )}
            />

            <Spacer size="lg" />

            <SectionLabel>Split With</SectionLabel>
            <ParticipantSelector 
              members={groupMembers} 
              selectedIds={participants} 
              onToggle={toggleParticipant} 
            />

            <Spacer size="lg" />

            <SectionLabel>Split Method</SectionLabel>
            <SplitGrid>
              {SPLIT_METHODS.map(method => (
                <SplitCard 
                  key={method.key} 
                  selected={splitType === method.key}
                  onPress={() => setSplitType(method.key)}
                >
                  <MaterialIcons 
                    name={method.icon as any} 
                    size={20} 
                    color={splitType === method.key ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                  />
                  <Label style={{ 
                    marginTop: 4, 
                    fontSize: 8, 
                    color: splitType === method.key ? theme.colors.primary : theme.colors.onSurfaceVariant 
                  }}>
                    {method.label}
                  </Label>
                </SplitCard>
              ))}
            </SplitGrid>

            {/* Split Editors */}
            <View style={{ marginBottom: Spacing.xl }}>
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

            <SectionLabel>Preview</SectionLabel>
            <SplitPreviewCard 
              paidBy={watch('paidBy')}
              splitDetails={splitDetails}
              allMembers={groupMembers}
            />

            <Spacer size="xl" />

            <SectionLabel>Category</SectionLabel>
            <Controller
              control={control}
              name="category"
              render={({ field: { value, onChange } }) => (
                <CategorySelector 
                  selectedCategory={value || 'Other'} 
                  onSelect={onChange} 
                />
              )}
            />

            <Spacer size="xl" />

            <SectionLabel>Media</SectionLabel>
            <Controller
              control={control}
              name="receiptUri"
              render={({ field: { value, onChange } }) => (
                <ReceiptUploader 
                  imageUri={value} 
                  onImageSelected={onChange} 
                />
              )}
            />

            <Spacer size="xxxl" />
          </ScrollView>
        </FormBody>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

export default AddExpenseScreen;
