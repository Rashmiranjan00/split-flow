import React from 'react';
import styled from 'styled-components/native';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuthStore } from '@/features/auth/store';
import { ActionButton } from '@/components/ActionButton';
import { getTotalBalance, MOCK_EXPENSES } from '@/data/mockData';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const HeaderBanner = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
  align-items: center;
  margin-bottom: ${Spacing.lg}px;
  border-bottom-left-radius: ${Radius.xl}px;
  border-bottom-right-radius: ${Radius.xl}px;
`;

const AvatarRing = styled.View`
  width: 88px;
  height: 88px;
  border-radius: 44px;
  background-color: ${Colors.primaryContainer};
  align-items: center;
  justify-content: center;
  border-width: 3px;
  border-color: ${Colors.primary};
  margin-bottom: ${Spacing.md}px;
`;

const AvatarInitial = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displaySm}px;
  font-weight: ${Typography.weights.bold};
`;

const UserName = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
`;

const UserEmail = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-top: 4px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  width: 100%;
  margin-top: ${Spacing.xl}px;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatDivider = styled.View`
  width: 1px;
  background-color: ${Colors.outlineVariant};
  margin-vertical: ${Spacing.xs}px;
`;

const StatNum = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
`;

const StatLabel = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-top: 2px;
`;

const Section = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.lg}px;
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: ${Spacing.sm}px;
`;

const MenuCard = styled.View`
  background-color: ${Colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  border-width: 1px;
  border-color: ${Colors.outlineVariant};
  overflow: hidden;
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.lg}px;
`;

const MenuItemBorder = styled.View`
  height: 1px;
  background-color: ${Colors.outlineVariant};
  margin-horizontal: ${Spacing.lg}px;
  opacity: 0.4;
`;

const MenuLabel = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
  flex: 1;
  margin-left: ${Spacing.md}px;
`;

const MenuValue = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodySm}px;
  margin-right: ${Spacing.sm}px;
`;

const LogoutSection = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.xxxl}px;
`;

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const totalBalance = getTotalBalance('usr_1');
  const expenseCount = MOCK_EXPENSES.filter(e => e.splits.some(s => s.userId === 'usr_1')).length;
  const totalSpent = MOCK_EXPENSES
    .flatMap(e => e.splits)
    .filter(s => s.userId === 'usr_1')
    .reduce((sum, s) => sum + s.value, 0);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)'); } },
      ]
    );
  };

  const menuItems = [
    { icon: 'notifications-none' as const, label: 'Notifications', value: 'On' },
    { icon: 'language' as const, label: 'Currency', value: 'USD ($)' },
    { icon: 'palette' as const, label: 'Theme', value: 'Dark' },
    { icon: 'privacy-tip' as const, label: 'Privacy', value: '' },
  ];

  return (
    <Container edges={['top']}>
      <Content showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <HeaderBanner>
          <AvatarRing>
            <AvatarInitial>{(user?.name?.[0] ?? 'U').toUpperCase()}</AvatarInitial>
          </AvatarRing>
          <UserName>{user?.name ?? 'Guest'}</UserName>
          <UserEmail>{user?.email ?? ''}</UserEmail>

          <StatsRow>
            <StatItem>
              <StatNum>{expenseCount}</StatNum>
              <StatLabel>Expenses</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNum style={{ color: totalBalance >= 0 ? Colors.tertiary : Colors.error }}>
                {totalBalance >= 0 ? '+' : ''}${Math.abs(totalBalance).toFixed(0)}
              </StatNum>
              <StatLabel>Balance</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatNum>${totalSpent.toFixed(0)}</StatNum>
              <StatLabel>Total spent</StatLabel>
            </StatItem>
          </StatsRow>
        </HeaderBanner>

        {/* Settings Menu */}
        <Section>
          <SectionTitle>Preferences</SectionTitle>
          <MenuCard>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                <MenuItem onPress={() => Alert.alert(item.label, 'Settings coming soon!')} activeOpacity={0.7}>
                  <MaterialIcons name={item.icon} size={20} color={Colors.onSurfaceVariant} />
                  <MenuLabel>{item.label}</MenuLabel>
                  {item.value ? <MenuValue>{item.value}</MenuValue> : null}
                  <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
                </MenuItem>
                {idx < menuItems.length - 1 && <MenuItemBorder />}
              </React.Fragment>
            ))}
          </MenuCard>
        </Section>

        <Section>
          <SectionTitle>Account</SectionTitle>
          <MenuCard>
            <MenuItem onPress={() => Alert.alert('Export', 'Data export coming soon!')} activeOpacity={0.7}>
              <MaterialIcons name="download" size={20} color={Colors.onSurfaceVariant} />
              <MenuLabel>Export Data</MenuLabel>
              <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
            </MenuItem>
            <MenuItemBorder />
            <MenuItem onPress={() => Alert.alert('Help', 'Help center coming soon!')} activeOpacity={0.7}>
              <MaterialIcons name="help-outline" size={20} color={Colors.onSurfaceVariant} />
              <MenuLabel>Help & Support</MenuLabel>
              <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
            </MenuItem>
          </MenuCard>
        </Section>

        <LogoutSection>
          <ActionButton title="Sign Out" variant="secondary" onPress={handleLogout} />
        </LogoutSection>
      </Content>
    </Container>
  );
}
