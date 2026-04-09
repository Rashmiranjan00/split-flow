import React from 'react';
import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.surface};
`;

const NavBar = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

const BackBtn = styled.TouchableOpacity`
  margin-right: ${Spacing.md}px;
`;

const NavTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${Spacing.lg}px;
`;

const InfoCard = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-top: ${Spacing.xl}px;
  margin-bottom: ${Spacing.lg}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const InfoLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${Spacing.xs}px;
`;

const InfoValue = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.semibold};
`;

const InfoRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.md}px;
  margin-top: ${Spacing.md}px;
`;

const InfoHalf = styled.View`
  flex: 1;
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${Spacing.sm}px;
  margin-top: ${Spacing.lg}px;
`;

const SplitRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${Colors.outlineVariant};
`;

const SplitAvatar = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${Colors.surfaceContainerHigh};
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.md}px;
`;

const SplitInitial = styled.Text`
  color: ${Colors.onSurface};
  font-size: 16px;
  font-weight: 700;
`;

const SplitName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  flex: 1;
`;

const SplitAmount = styled.Text`
  color: ${Colors.tertiary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const TypeBadge = styled.View`
  background-color: ${Colors.primaryContainer};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.sm}px;
  padding-vertical: 4px;
  align-self: flex-start;
  margin-top: ${Spacing.sm}px;
`;

const TypeBadgeText = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
`;

const TotalCheckRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${Spacing.md}px 0;
  margin-top: ${Spacing.sm}px;
`;

const TotalLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TotalValue = styled.Text`
  color: ${Colors.tertiary};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.semibold};
`;

// These would come from navigation state / params in a real flow.
// Showing static demo data that mirrors what AddExpense would produce.
const DEMO_EXPENSE = {
  title: 'Dinner at Nobu',
  total: 240.0,
  payer: 'You',
  group: 'Summer Trip 🏖',
  splitType: 'EQUAL' as const,
  members: [
    { id: 'usr_1', name: 'You', share: 60 },
    { id: 'usr_2', name: 'Sarah K.', share: 60 },
    { id: 'usr_3', name: 'James R.', share: 60 },
    { id: 'usr_4', name: 'Mia T.', share: 60 },
  ],
};

export default function SplitExpenseScreen() {
  const router = useRouter();

  return (
    <Container edges={['top']}>
      <NavBar>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </BackBtn>
        <NavTitle>Split Breakdown</NavTitle>
      </NavBar>

      <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Expense Summary */}
        <InfoCard>
          <InfoLabel>Expense</InfoLabel>
          <InfoValue>{DEMO_EXPENSE.title}</InfoValue>
          <InfoRow>
            <InfoHalf>
              <InfoLabel>Total</InfoLabel>
              <InfoValue style={{ fontSize: 20 }}>${DEMO_EXPENSE.total.toFixed(2)}</InfoValue>
            </InfoHalf>
            <InfoHalf>
              <InfoLabel>Paid by</InfoLabel>
              <InfoValue style={{ fontSize: 20 }}>{DEMO_EXPENSE.payer}</InfoValue>
            </InfoHalf>
          </InfoRow>
          <TypeBadge>
            <TypeBadgeText>= Split equally</TypeBadgeText>
          </TypeBadge>
        </InfoCard>

        {/* Per-person breakdown */}
        <SectionTitle>Each person owes</SectionTitle>
        {DEMO_EXPENSE.members.map(member => (
          <SplitRow key={member.id}>
            <SplitAvatar>
              <SplitInitial>{member.name[0].toUpperCase()}</SplitInitial>
            </SplitAvatar>
            <SplitName>{member.name}</SplitName>
            <SplitAmount>${member.share.toFixed(2)}</SplitAmount>
          </SplitRow>
        ))}

        <TotalCheckRow>
          <TotalLabel>Total check</TotalLabel>
          <TotalValue>
            ${DEMO_EXPENSE.members.reduce((s, m) => s + m.share, 0).toFixed(2)} ✓
          </TotalValue>
        </TotalCheckRow>

        <SectionTitle>Group</SectionTitle>
        <InfoCard>
          <InfoValue style={{ fontSize: 18 }}>{DEMO_EXPENSE.group}</InfoValue>
        </InfoCard>
      </Content>
    </Container>
  );
}
