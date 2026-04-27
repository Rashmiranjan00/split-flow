import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  SafeScreen,
  Content,
  Row,
  SectionHeader,
  Spacer,
  SurfaceCard,
  TxnRow,
} from '@/shared/components/Layout';
import {
  Amount,
  RowTitle,
  RowSubtitle,
  SectionLabel,
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';

const HeaderBar = styled(Row)`
  padding: ${Spacing.sm}px ${Spacing.screenPadding}px;
  margin-bottom: 0;
`;

const BackBtn = styled.TouchableOpacity`
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  margin-right: ${Spacing.sm}px;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ExpenseTitle = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 22px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: -0.4px;
`;

const MetaLabel = styled.Text`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-bottom: 2px;
`;

const MetaValue = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 16px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.onSurface};
`;

const TypeBadge = styled.View`
  align-self: flex-start;
  margin-top: ${Spacing.md}px;
  background-color: ${({ theme }) => theme.colors.primaryFixedDim};
  border-radius: ${Radius.full}px;
  padding: 4px 10px;
`;

const TypeBadgeText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.brandDark};
`;

const TotalCheckRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: ${Spacing.md}px ${Spacing.screenPadding}px;
`;

const DEMO_EXPENSE = {
  title: 'Dinner at Nobu',
  total: 240.0,
  payer: 'You',
  group: 'Summer Trip',
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

  const totalMembersShare = React.useMemo(
    () => DEMO_EXPENSE.members.reduce((s, m) => s + m.share, 0),
    []
  );
  const totalMatches = Math.abs(totalMembersShare - DEMO_EXPENSE.total) < 0.01;

  return (
    <SafeScreen>
      <HeaderBar>
        <BackBtn onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={theme.colors.onSurface} />
        </BackBtn>
        <HeaderTitle>Split breakdown</HeaderTitle>
      </HeaderBar>

      <Content showsVerticalScrollIndicator={false}>
        <View style={{ padding: Spacing.screenPadding }}>
          <SurfaceCard>
            <SectionLabel style={{ fontSize: 11, marginBottom: Spacing.xs }}>Expense</SectionLabel>
            <ExpenseTitle>{DEMO_EXPENSE.title}</ExpenseTitle>

            <Row style={{ marginTop: Spacing.md, marginBottom: 0 }}>
              <View style={{ flex: 1 }}>
                <MetaLabel>Total</MetaLabel>
                <MetaValue>${DEMO_EXPENSE.total.toFixed(2)}</MetaValue>
              </View>
              <View style={{ flex: 1 }}>
                <MetaLabel>Paid by</MetaLabel>
                <MetaValue>{DEMO_EXPENSE.payer}</MetaValue>
              </View>
            </Row>

            <TypeBadge>
              <TypeBadgeText>Split equally</TypeBadgeText>
            </TypeBadge>
          </SurfaceCard>
        </View>

        <SectionHeader label="Each person owes" />
        {DEMO_EXPENSE.members.map((member, idx) => (
          <TxnRow
            key={member.id}
            isLast={idx === DEMO_EXPENSE.members.length - 1}
            onPress={() => {}}
            leading={<Avatar name={member.name} size={Spacing.avatarSm} />}
            title={<RowTitle>{member.name}</RowTitle>}
            trailing={<Amount positive>${member.share.toFixed(2)}</Amount>}
          />
        ))}

        <TotalCheckRow>
          <SectionLabel style={{ fontSize: 11 }}>Total check</SectionLabel>
          <RowTitle
            style={{
              color: totalMatches ? theme.colors.tertiary : theme.colors.danger,
            }}
          >
            ${totalMembersShare.toFixed(2)} {totalMatches ? '✓' : ''}
          </RowTitle>
        </TotalCheckRow>

        <View style={{ padding: Spacing.screenPadding }}>
          <SectionLabel style={{ fontSize: 11, marginBottom: Spacing.sm }}>Group</SectionLabel>
          <SurfaceCard>
            <RowTitle>{DEMO_EXPENSE.group}</RowTitle>
          </SurfaceCard>
        </View>

        <Spacer size="xxxl" />
      </Content>
    </SafeScreen>
  );
};

export default SplitExpenseScreen;
