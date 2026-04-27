import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';
import {
  Screen,
  Content,
  Row,
  Spacer,
  SurfaceCard,
} from '@/shared/components/Layout';
import { BodyMd, BodySm, SectionLabel } from '@/shared/components/Typography';
import { Avatar } from '@/shared/components/Avatar';
import { useUser } from '@/shared/hooks/useUser';
import { useBalances } from '@/features/balances/hooks/useBalances';
import { useExpenseStore } from '@/features/expenses/store';
import { useThemeStore, ThemeMode } from '@/shared/hooks/useThemeStore';
import { useCurrencyStore, CURRENCIES, CurrencyCode } from '@/shared/hooks/useCurrencyStore';
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter';

const HeaderPadding = styled.View`
  padding: ${Spacing.md}px ${Spacing.screenPadding}px ${Spacing.sm}px;
`;

const Name = styled.Text`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 18px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme }) => theme.colors.onSurface};
  margin-top: ${Spacing.sm}px;
`;

const Email = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const HeroCard = styled(SurfaceCard)`
  align-items: center;
  padding: ${Spacing.lg}px ${Spacing.md}px;
`;

const StatsRow = styled.View`
  flex-direction: row;
  width: 100%;
  margin-top: ${Spacing.md}px;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled.Text<{ tone?: 'positive' | 'negative' }>`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 17px;
  font-weight: ${TypographyTokens.weights.bold};
  color: ${({ theme, tone }) =>
    tone === 'positive'
      ? theme.colors.tertiary
      : tone === 'negative'
      ? theme.colors.danger
      : theme.colors.onSurface};
`;

const StatLabel = styled.Text`
  margin-top: 2px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

const StatDivider = styled.View`
  width: 1px;
  background-color: ${({ theme }) => theme.colors.divider};
  height: 28px;
  align-self: center;
`;

const Section = styled.View`
  padding: 0 ${Spacing.screenPadding}px;
  margin-top: ${Spacing.lg}px;
`;

const SegmentedRow = styled.View`
  flex-direction: row;
  gap: ${Spacing.sm}px;
  margin-top: ${Spacing.sm}px;
`;

const PillOption = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: ${Radius.full}px;
  align-items: center;
  background-color: ${({ active, theme }: { active: boolean; theme: any }) =>
    active ? theme.colors.primary : theme.colors.surfaceContainerLow};
`;

const PillText = styled.Text<{ active: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ active, theme }: { active: boolean; theme: any }) =>
    active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant};
`;

const MenuCard = styled(SurfaceCard)`
  padding: 0;
`;

const MenuItem = styled.TouchableOpacity<{ destructive?: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${Spacing.md}px;
`;

const MenuLabel = styled.Text<{ destructive?: boolean }>`
  flex: 1;
  margin-left: ${Spacing.md}px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.medium};
  color: ${({ destructive, theme }: { destructive?: boolean; theme: any }) =>
    destructive ? theme.colors.danger : theme.colors.onSurface};
`;

const MenuValue = styled.Text`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
  margin-right: ${Spacing.xs}px;
`;

const MenuRowDivider = styled.View`
  height: 0.5px;
  background-color: ${({ theme }) => theme.colors.divider};
  margin-left: ${Spacing.md * 2 + 18}px;
`;

const LogoutWrapper = styled.View`
  padding: ${Spacing.lg}px ${Spacing.screenPadding}px ${Spacing.xxxl}px;
`;

const LogoutButton = styled.TouchableOpacity`
  height: 50px;
  border-radius: ${Radius.buttonRadius}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.divider};
  align-items: center;
  justify-content: center;
`;

const LogoutText = styled.Text`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme }) => theme.colors.danger};
`;

const THEME_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

const ProfileScreen = () => {
  const { user, userId, logout } = useUser();
  const { netBalance } = useBalances();
  const router = useRouter();
  const theme = useTheme();
  const themeMode = useThemeStore((state) => state.mode);
  const setThemeMode = useThemeStore((state) => state.setMode);
  const selectedCurrency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const allExpenses = useExpenseStore((s) => s.expenses);
  const { formatCurrency } = useCurrencyFormatter();

  const expenseCount = React.useMemo(
    () =>
      allExpenses.filter((e) =>
        (e.splitDetails || []).some((s) => s.userId === userId)
      ).length,
    [allExpenses, userId]
  );

  const totalSpent = React.useMemo(
    () =>
      allExpenses
        .flatMap((e) => e.splitDetails || [])
        .filter((s) => s.userId === userId)
        .reduce((sum, s) => sum + s.owedAmount, 0),
    [allExpenses, userId]
  );

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)' as any);
        },
      },
    ]);
  };

  const menuItems: { icon: any; label: string; value?: string }[] = [
    { icon: 'notifications-none', label: 'Notifications', value: 'On' },
    { icon: 'privacy-tip', label: 'Privacy' },
  ];

  const accountItems: { icon: any; label: string; onPress: () => void }[] = [
    {
      icon: 'download',
      label: 'Export data',
      onPress: () => Alert.alert('Export', 'Data export coming soon!'),
    },
    {
      icon: 'help-outline',
      label: 'Help & support',
      onPress: () => Alert.alert('Help', 'Help center coming soon!'),
    },
  ];

  const netTone: 'positive' | 'negative' | undefined =
    netBalance > 0 ? 'positive' : netBalance < 0 ? 'negative' : undefined;

  return (
    <Screen>
      <Content showsVerticalScrollIndicator={false}>
        <HeaderPadding>
          <HeroCard>
            <Avatar
              name={user?.name ?? 'User'}
              size={Spacing.avatarLg}
              borderWidth={2}
              borderColor={theme.colors.brandAccent}
            />
            <Name>{user?.name ?? 'Guest'}</Name>
            <Email>{user?.email ?? ''}</Email>

            <StatsRow>
              <StatItem>
                <StatValue>{expenseCount}</StatValue>
                <StatLabel>Expenses</StatLabel>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatValue tone={netTone}>
                  {formatCurrency(netBalance, { sign: netBalance > 0, decimals: 0 })}
                </StatValue>
                <StatLabel>Balance</StatLabel>
              </StatItem>
              <StatDivider />
              <StatItem>
                <StatValue>{formatCurrency(totalSpent, { decimals: 0 })}</StatValue>
                <StatLabel>Total spent</StatLabel>
              </StatItem>
            </StatsRow>
          </HeroCard>
        </HeaderPadding>

        <Section>
          <SectionLabel style={{ fontSize: 11 }}>Appearance</SectionLabel>
          <SegmentedRow>
            {THEME_OPTIONS.map((opt) => {
              const active = themeMode === opt.key;
              return (
                <PillOption
                  key={opt.key}
                  active={active}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(opt.key)}
                >
                  <PillText active={active}>{opt.label}</PillText>
                </PillOption>
              );
            })}
          </SegmentedRow>
        </Section>

        <Section>
          <SectionLabel style={{ fontSize: 11 }}>Currency</SectionLabel>
          <SegmentedRow>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const active = selectedCurrency === code;
              return (
                <PillOption
                  key={code}
                  active={active}
                  activeOpacity={0.7}
                  onPress={() => setCurrency(code)}
                >
                  <PillText active={active}>
                    {CURRENCIES[code].symbol} {CURRENCIES[code].code}
                  </PillText>
                </PillOption>
              );
            })}
          </SegmentedRow>
        </Section>

        <Section>
          <SectionLabel style={{ fontSize: 11 }}>Preferences</SectionLabel>
          <Spacer size="sm" />
          <MenuCard>
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                <MenuItem
                  activeOpacity={0.6}
                  onPress={() => Alert.alert(item.label, 'Settings coming soon!')}
                >
                  <MaterialIcons name={item.icon} size={18} color={theme.colors.onSurfaceVariant} />
                  <MenuLabel>{item.label}</MenuLabel>
                  {item.value ? <MenuValue>{item.value}</MenuValue> : null}
                  <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
                </MenuItem>
                {idx < menuItems.length - 1 && <MenuRowDivider />}
              </React.Fragment>
            ))}
          </MenuCard>
        </Section>

        <Section>
          <SectionLabel style={{ fontSize: 11 }}>Account</SectionLabel>
          <Spacer size="sm" />
          <MenuCard>
            {accountItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                <MenuItem activeOpacity={0.6} onPress={item.onPress}>
                  <MaterialIcons name={item.icon} size={18} color={theme.colors.onSurfaceVariant} />
                  <MenuLabel>{item.label}</MenuLabel>
                  <MaterialIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
                </MenuItem>
                {idx < accountItems.length - 1 && <MenuRowDivider />}
              </React.Fragment>
            ))}
          </MenuCard>
        </Section>

        <LogoutWrapper>
          <LogoutButton onPress={handleLogout} activeOpacity={0.7}>
            <LogoutText>Sign out</LogoutText>
          </LogoutButton>
        </LogoutWrapper>
      </Content>
    </Screen>
  );
};

export default ProfileScreen;
