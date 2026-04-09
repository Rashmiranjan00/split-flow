import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
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
  Headline,
  Display
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';

const NavBar = styled(Row)`
  padding: ${Spacing.md}px ${Spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-bottom: 0;
`;

const BackBtn = styled.TouchableOpacity`
  margin-right: ${Spacing.md}px;
`;

const InfoCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-top: ${Spacing.xl}px;
  margin-bottom: ${Spacing.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
`;

const SplitRow = styled(SpaceBetweenRow)`
  padding: ${Spacing.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-bottom: 0;
`;

const TypeBadge = styled.View`
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.sm}px;
  padding-vertical: 4px;
  align-self: flex-start;
  margin-top: ${Spacing.sm}px;
`;

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

const SplitExpenseScreen = () => {
  const router = useRouter();
  const theme = useTheme();

  const totalMembersShare = React.useMemo(() => 
    DEMO_EXPENSE.members.reduce((s, m) => s + m.share, 0),
    []
  );

  return (
    <SafeScreen>
      <NavBar>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </BackBtn>
        <Title>Split Breakdown</Title>
      </NavBar>

      <Content showsVerticalScrollIndicator={false}>
        <PaddedContainer>
          <InfoCard>
            <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Expense</Label>
            <Headline style={{ fontSize: 24 }}>{DEMO_EXPENSE.title}</Headline>
            
            <Row style={{ marginTop: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Total</Label>
                <Title style={{ fontSize: 20 }}>${DEMO_EXPENSE.total.toFixed(2)}</Title>
              </View>
              <View style={{ flex: 1 }}>
                <Label style={{ textTransform: 'uppercase', marginBottom: 4 }}>Paid by</Label>
                <Title style={{ fontSize: 20 }}>{DEMO_EXPENSE.payer}</Title>
              </View>
            </Row>

            <TypeBadge>
              <BodySm style={{ color: theme.colors.primary, fontWeight: '600' }}>= Split equally</BodySm>
            </TypeBadge>
          </InfoCard>

          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Each person owes
          </Label>
          {DEMO_EXPENSE.members.map(member => (
            <SplitRow key={member.id}>
              <Row>
                <Avatar name={member.name} size={40} />
                <Spacer size="md" horizontal />
                <BodyMd style={{ fontWeight: '500' }}>{member.name}</BodyMd>
              </Row>
              <BodyMd style={{ color: theme.colors.tertiary, fontWeight: '600' }}>
                ${member.share.toFixed(2)}
              </BodyMd>
            </SplitRow>
          ))}

          <SpaceBetweenRow style={{ paddingVertical: Spacing.md, marginTop: Spacing.sm }}>
            <Label style={{ textTransform: 'uppercase' }}>Total check</Label>
            <BodySm style={{ color: theme.colors.tertiary, fontWeight: '600' }}>
              ${totalMembersShare.toFixed(2)} ✓
            </BodySm>
          </SpaceBetweenRow>

          <Spacer size="lg" />
          <Label style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: Spacing.sm }}>
            Group
          </Label>
          <InfoCard style={{ marginTop: 0 }}>
            <Title style={{ fontSize: 18 }}>{DEMO_EXPENSE.group}</Title>
          </InfoCard>

          <Spacer size="xxxl" />
        </PaddedContainer>
      </Content>
    </SafeScreen>
  );
};

const PaddedContainer = styled.View`
  padding-horizontal: ${Spacing.lg}px;
`;

const View = styled.View``;

export default SplitExpenseScreen;
