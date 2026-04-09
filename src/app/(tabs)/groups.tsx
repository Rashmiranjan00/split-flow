import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { MOCK_GROUPS, MOCK_MEMBERS, getGroupBalance } from '@/data/mockData';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${Spacing.lg}px;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: ${Spacing.md}px;
  margin-bottom: ${Spacing.xl}px;
`;

const HeaderTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
  letter-spacing: -1.5px;
`;

const AddButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${Colors.primaryContainer};
  align-items: center;
  justify-content: center;
`;

const GroupCardWrapper = styled.TouchableOpacity`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  padding: ${Spacing.lg}px;
  margin-bottom: ${Spacing.md}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
`;

const GroupCardTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${Spacing.md}px;
`;

const GroupIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: ${Radius.md}px;
  background-color: ${Colors.primaryContainer};
  align-items: center;
  justify-content: center;
`;

const GroupEmoji = styled.Text`
  font-size: 22px;
`;

const GroupInfo = styled.View`
  flex: 1;
  margin-left: ${Spacing.md}px;
`;

const GroupName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
`;

const GroupDesc = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-top: 2px;
`;

const BalancePill = styled.View<{ positive: boolean }>`
  background-color: ${({ positive }: { positive: boolean }) =>
    positive ? 'rgba(60, 221, 199, 0.12)' : 'rgba(255, 180, 171, 0.12)'};
  border-radius: ${Radius.full}px;
  padding-horizontal: ${Spacing.sm}px;
  padding-vertical: 4px;
`;

const BalanceText = styled.Text<{ positive: boolean }>`
  color: ${({ positive }: { positive: boolean }) => positive ? Colors.tertiary : Colors.error};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  font-weight: ${Typography.weights.bold};
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${Colors.outlineVariant};
  margin-bottom: ${Spacing.md}px;
  opacity: 0.4;
`;

const MemberChips = styled.View`
  flex-direction: row;
  align-items: center;
`;

const MemberChip = styled.View`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${Colors.surfaceVariant};
  align-items: center;
  justify-content: center;
  border-width: 2px;
  border-color: ${Colors.surfaceContainerLow};
  margin-left: -6px;
`;

const MemberInitial = styled.Text`
  color: ${Colors.onSurface};
  font-size: 10px;
  font-weight: 700;
`;

const FirstChip = styled(MemberChip)`
  margin-left: 0px;
`;

const MemberCount = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-left: ${Spacing.sm}px;
`;

const EmptyState = styled.View`
  align-items: center;
  padding-vertical: ${Spacing.xxxl}px;
`;

const EmptyEmoji = styled.Text`
  font-size: 48px;
  margin-bottom: ${Spacing.md}px;
`;

const EmptyTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleMd}px;
  font-weight: ${Typography.weights.semibold};
  margin-bottom: ${Spacing.sm}px;
`;

const EmptyDesc = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  text-align: center;
`;

function getGroupEmoji(name: string): string {
  if (name.includes('🏖')) return '🏖';
  if (name.includes('🏠')) return '🏠';
  if (name.includes('🍽')) return '🍽';
  if (name.includes('✈')) return '✈';
  return '💼';
}

export default function GroupsScreen() {
  const router = useRouter();

  return (
    <Container edges={['top']}>
      <Content showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <HeaderRow>
          <HeaderTitle>Vaults</HeaderTitle>
          <AddButton
            onPress={() => Alert.alert('New Group', 'Create group coming soon!')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={22} color={Colors.primary} />
          </AddButton>
        </HeaderRow>

        {MOCK_GROUPS.length === 0 ? (
          <EmptyState>
            <EmptyEmoji>🏛</EmptyEmoji>
            <EmptyTitle>No vaults yet</EmptyTitle>
            <EmptyDesc>Create a group to start splitting expenses with friends.</EmptyDesc>
          </EmptyState>
        ) : (
          MOCK_GROUPS.map(group => {
            const balance = getGroupBalance(group.id, 'usr_1');
            const isPositive = balance >= 0;
            const visibleMembers = group.members.slice(0, 4);
            const remaining = group.members.length - visibleMembers.length;

            return (
              <GroupCardWrapper
                key={group.id}
                onPress={() => router.push(`/group/${group.id}` as any)}
                activeOpacity={0.75}
              >
                <GroupCardTop>
                  <GroupIcon>
                    <GroupEmoji>{getGroupEmoji(group.name)}</GroupEmoji>
                  </GroupIcon>
                  <GroupInfo>
                    <GroupName>{group.name.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim()}</GroupName>
                    <GroupDesc>{group.description}</GroupDesc>
                  </GroupInfo>
                  <BalancePill positive={isPositive}>
                    <BalanceText positive={isPositive}>
                      {isPositive ? '+' : ''}${Math.abs(balance).toFixed(2)}
                    </BalanceText>
                  </BalancePill>
                </GroupCardTop>

                <Divider />

                <MemberChips>
                  {visibleMembers.map((userId, idx) => {
                    const member = MOCK_MEMBERS.find(m => m.id === userId);
                    const Component = idx === 0 ? FirstChip : MemberChip;
                    return (
                      <Component key={userId}>
                        <MemberInitial>{(member?.name?.[0] ?? '?').toUpperCase()}</MemberInitial>
                      </Component>
                    );
                  })}
                  <MemberCount>
                    {remaining > 0 ? `+${remaining} · ` : ''}{group.members.length} members
                  </MemberCount>
                </MemberChips>
              </GroupCardWrapper>
            );
          })
        )}
      </Content>
    </Container>
  );
}
