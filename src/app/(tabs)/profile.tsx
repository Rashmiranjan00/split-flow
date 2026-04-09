import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Spacing, Radius } from '@/shared/constants/spacing';
import { 
  Screen, 
  Content, 
  Row, 
  Spacer 
} from '@/shared/components/Layout';
import { 
  Title, 
  BodyMd, 
  BodySm, 
  Label,
  Display
} from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { ActionButton } from '@/shared/components/ActionButton';
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useThemeStore, ThemeMode } from '@/shared/hooks/useThemeStore';
import { useCurrencyStore, CURRENCIES, CurrencyCode } from '@/shared/hooks/useCurrencyStore';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';
import { MOCK_EXPENSES } from '@/shared/data/mockData';

const HeaderBanner = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  padding: ${Spacing.xxl}px ${Spacing.lg}px ${Spacing.xl}px;
  align-items: center;
  margin-bottom: ${Spacing.lg}px;
  border-bottom-left-radius: ${Radius.xl}px;
  border-bottom-right-radius: ${Radius.xl}px;
`;

const StatsRow = styled(Row)`
  width: 100%;
  margin-top: ${Spacing.xl}px;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatDivider = styled.View`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-vertical: ${Spacing.xs}px;
  height: 24px;
`;

const Section = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.lg}px;
`;

const MenuCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${Radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.outlineVariant};
  overflow: hidden;
`;

const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px ${Spacing.lg}px;
`;

const MenuItemBorder = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.outlineVariant};
  margin-horizontal: ${Spacing.lg}px;
  opacity: 0.4;
`;

const MenuLabel = styled(BodyMd)`
  flex: 1;
  margin-left: ${Spacing.md}px;
`;

const MenuValue = styled(BodySm)`
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-right: ${Spacing.sm}px;
`;

const LogoutSection = styled.View`
  margin-horizontal: ${Spacing.lg}px;
  margin-bottom: ${Spacing.xxxl}px;
`;

// Theme Picker
interface ThemeOptionProps {
  active: boolean;
}

const ThemePickerRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  margin-top: ${Spacing.sm}px;
`;

const ThemeOption = styled.TouchableOpacity<ThemeOptionProps>`
  flex: 1;
  padding-vertical: ${Spacing.sm}px;
  border-radius: ${Radius.md}px;
  align-items: center;
  background-color: ${({ active, theme }: ThemeOptionProps & { theme: any }) =>
    active ? theme.colors.primaryContainer : theme.colors.surfaceContainerHigh};
  border-width: 1px;
  border-color: ${({ active, theme }: ThemeOptionProps & { theme: any }) =>
    active ? theme.colors.primary : 'transparent'};
`;

const ThemeOptionText = styled(BodySm)<ThemeOptionProps>`
  color: ${({ active, theme }: ThemeOptionProps & { theme: any }) =>
    active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-weight: ${({ active }: ThemeOptionProps) => active ? '700' : '400'};
`;

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: string }[] = [
  { key: 'light', label: 'Light', icon: 'light-mode' },
  { key: 'dark', label: 'Dark', icon: 'dark-mode' },
  { key: 'system', label: 'System', icon: 'settings-brightness' },
];

const ProfileScreen = () => {
  const { user, userId, logout } = useUser();
  const { totalBalance } = useBalances();
  const router = useRouter();
  const theme = useTheme();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);
  const selectedCurrency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const { formatCurrency } = useCurrencyFormatter();

  const expenseCount = React.useMemo(() => 
    MOCK_EXPENSES.filter(e => e.splits.some(s => s.userId === userId)).length,
    [userId]
  );
  
  const totalSpent = React.useMemo(() => 
    MOCK_EXPENSES
      .flatMap(e => e.splits)
      .filter(s => s.userId === userId)
      .reduce((sum, s) => sum + s.value, 0),
    [userId]
  );

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
    { icon: 'privacy-tip' as const, label: 'Privacy', value: '' },
  ];

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <HeaderBanner>
          <Avatar name={user?.name ?? 'User'} size={88} borderWidth={3} borderColor={theme.colors.primary} />
          <Spacer size="md" />
          <Display style={{ fontSize: 24 }}>{user?.name ?? 'Guest'}</Display>
          <BodySm>{user?.email ?? ''}</BodySm>

          <StatsRow>
            <StatItem>
              <Title>{expenseCount}</Title>
              <Label>Expenses</Label>
            </StatItem>
            <StatDivider />
            <StatItem>
              <Title style={{ color: totalBalance >= 0 ? theme.colors.tertiary : theme.colors.error }}>
                {formatCurrency(totalBalance, { sign: totalBalance > 0, decimals: 0 })}
              </Title>
              <Label>Balance</Label>
            </StatItem>
            <StatDivider />
            <StatItem>
              <Title>{formatCurrency(totalSpent, { decimals: 0 })}</Title>
              <Label>Total spent</Label>
            </StatItem>
          </StatsRow>
        </HeaderBanner>

        {/* Theme Picker */}
        <Section>
          <Label style={{ letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm }}>
            Appearance
          </Label>
          <ThemePickerRow>
            {THEME_OPTIONS.map(opt => (
              <ThemeOption
                key={opt.key}
                active={themeMode === opt.key}
                onPress={() => setThemeMode(opt.key)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={opt.icon as any}
                  size={18}
                  color={themeMode === opt.key ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <ThemeOptionText active={themeMode === opt.key}>{opt.label}</ThemeOptionText>
              </ThemeOption>
            ))}
          </ThemePickerRow>
        </Section>

        {/* Currency Picker */}
        <Section>
          <Label style={{ letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm }}>
            Default Currency
          </Label>
          <ThemePickerRow>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map(code => (
              <ThemeOption
                key={code}
                active={selectedCurrency === code}
                onPress={() => setCurrency(code)}
                activeOpacity={0.7}
              >
                <ThemeOptionText active={selectedCurrency === code}>
                  {CURRENCIES[code].symbol} {CURRENCIES[code].code}
                </ThemeOptionText>
              </ThemeOption>
            ))}
          </ThemePickerRow>
        </Section>

        {/* Settings Menu */}
        <Section>
          <Label style={{ letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm }}>
            Preferences
          </Label>
          <MenuCard>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                <MenuItem onPress={() => Alert.alert(item.label, 'Settings coming soon!')} activeOpacity={0.7}>
                  <MaterialIcons name={item.icon} size={20} color={theme.colors.onSurfaceVariant} />
                  <MenuLabel>{item.label}</MenuLabel>
                  {item.value ? <MenuValue>{item.value}</MenuValue> : null}
                  <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
                </MenuItem>
                {idx < menuItems.length - 1 && <MenuItemBorder />}
              </React.Fragment>
            ))}
          </MenuCard>
        </Section>

        <Section>
          <Label style={{ letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: Spacing.sm }}>
            Account
          </Label>
          <MenuCard>
            <MenuItem onPress={() => Alert.alert('Export', 'Data export coming soon!')} activeOpacity={0.7}>
              <MaterialIcons name="download" size={20} color={theme.colors.onSurfaceVariant} />
              <MenuLabel>Export Data</MenuLabel>
              <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
            </MenuItem>
            <MenuItemBorder />
            <MenuItem onPress={() => Alert.alert('Help', 'Help center coming soon!')} activeOpacity={0.7}>
              <MaterialIcons name="help-outline" size={20} color={theme.colors.onSurfaceVariant} />
              <MenuLabel>Help & Support</MenuLabel>
              <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
            </MenuItem>
          </MenuCard>
        </Section>

        <LogoutSection>
          <ActionButton title="Sign Out" variant="secondary" onPress={handleLogout} />
        </LogoutSection>
      </Content>
    </Screen>
  );
};

export default ProfileScreen;
