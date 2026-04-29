import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import { usePathname, useRouter } from 'expo-router';
import { Home, Users, Contact, Bell, User } from 'lucide-react-native';
import { Typography } from '@/shared/constants/typography';
import { Spacing } from '@/shared/constants/spacing';

const SIDEBAR_WIDTH = 260;
const DESKTOP_BREAKPOINT = 900;

interface NavItem {
  label: string;
  icon: typeof Home;
  route: string;
  matchPath: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: Home, route: '/(tabs)', matchPath: '/' },
  { label: 'Groups', icon: Users, route: '/(tabs)/groups', matchPath: '/groups' },
  { label: 'Friends', icon: Contact, route: '/(tabs)/friends', matchPath: '/friends' },
  { label: 'Activity', icon: Bell, route: '/(tabs)/activity', matchPath: '/activity' },
  { label: 'Profile', icon: User, route: '/(tabs)/profile', matchPath: '/profile' },
];

export function useSidebarVisible() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
}

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (item: NavItem) => {
    if (item.matchPath === '/') {
      return pathname === '/' || pathname === '/(tabs)';
    }
    return pathname.startsWith(item.matchPath);
  };

  return (
    <Container>
      <LogoArea>
        <AppName>SplitFlow</AppName>
      </LogoArea>

      <NavList>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const color = active ? theme.colors.primary : theme.colors.onSurfaceVariant;

          return (
            <NavItemButton
              key={item.label}
              onPress={() => router.push(item.route as any)}
              $active={active}>
              <Icon size={20} color={color} />
              <NavLabel $active={active}>{item.label}</NavLabel>
            </NavItemButton>
          );
        })}
      </NavList>
    </Container>
  );
};

const Container = styled.View`
  width: ${SIDEBAR_WIDTH}px;
  background-color: ${({ theme }) => theme.colors.surfaceContainerLowest};
  border-right-width: 1px;
  border-right-color: ${({ theme }) => theme.colors.divider};
  padding-top: ${Spacing.xl}px;
`;

const LogoArea = styled.View`
  padding-horizontal: ${Spacing.lg}px;
  padding-bottom: ${Spacing.xl}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
  margin-bottom: ${Spacing.md}px;
`;

const AppName = styled.Text`
  font-family: ${Typography.fonts.bold};
  font-size: ${Typography.sizes.headlineSm}px;
  color: ${({ theme }) => theme.colors.primary};
`;

const NavList = styled.View`
  padding-horizontal: ${Spacing.sm}px;
`;

const NavItemButton = styled.TouchableOpacity<{ $active: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${Spacing.rowVertical}px;
  padding-horizontal: ${Spacing.md}px;
  border-radius: ${Spacing.sm}px;
  margin-bottom: ${Spacing.xs}px;
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceContainerHigh : 'transparent'};
`;

const NavLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ $active }) => ($active ? Typography.fonts.semibold : Typography.fonts.medium)};
  font-size: ${Typography.sizes.bodyMd}px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  margin-left: ${Spacing.md}px;
`;
