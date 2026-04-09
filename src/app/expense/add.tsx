import React from 'react';
import styled from 'styled-components/native';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { ActionButton } from '@/components/ActionButton';
import { useRouter } from 'expo-router';

// Glassmorphism modal wrapper
const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.surface};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${Spacing.lg}px;
  align-items: center;
`;

const Title = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.headlineMd}px;
  font-weight: ${Typography.weights.bold};
`;

const CloseText = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
`;

const InputContainer = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-vertical: ${Spacing.xl}px;
  align-items: center;
`;

const AmountInput = styled.TextInput`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  text-align: center;
  width: 100%;
`;

const HelperText = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  margin-top: ${Spacing.sm}px;
`;

const Label = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  margin-left: ${Spacing.lg}px;
  margin-bottom: ${Spacing.sm}px;
`;

const InputField = styled.TextInput`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.md}px;
  padding: ${Spacing.lg}px;
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.lg}px;
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
`;

export default function AddExpenseScreen() {
  const router = useRouter();

  return (
    <Container>
      <Header>
        <Title>New Expense</Title>
        <CloseText onPress={() => router.back()}>Cancel</CloseText>
      </Header>

      <InputContainer>
        <AmountInput 
          placeholder="$0.00" 
          placeholderTextColor={Colors.surfaceVariant}
          keyboardType="decimal-pad"
          autoFocus
        />
        <HelperText>Amount Paid</HelperText>
      </InputContainer>

      <Label>Description</Label>
      <InputField placeholder="What was this for?" placeholderTextColor={Colors.onSurfaceVariant} />

      <Label>Paid By</Label>
      <InputField value="You" editable={false} />

      <View style={{ flex: 1 }} />
      <View style={{ padding: Spacing.lg, paddingBottom: Spacing.xxxl }}>
        <ActionButton title="Next: Split Options" onPress={() => router.push('/expense/split')} />
      </View>
    </Container>
  );
}
