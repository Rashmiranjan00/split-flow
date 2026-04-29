import React, { useState, useCallback } from 'react';
import { Platform, Pressable, useWindowDimensions } from 'react-native';
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

export const Sidebar: React.FC = React.memo(() => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (item: NavItem) => {
    if (item.matchPath === '/') {
      return pathname === '/' || pathname === '/(tabs)';
    }
    return pathname.startsWith(item.matchPath);
  };

  const handleNav = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router]
  );

  return (
    <Container>
      <LogoArea>
        <AppName>SplitFlow</AppName>
      </LogoArea>

      <NavList>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <NavItemWithHover key={item.label} item={item} active={active} onPress={handleNav} />
          );
        })}
      </NavList>
    </Container>
  );
});

Sidebar.displayName = 'Sidebar';

// --- Nav Item with Hover ---

interface NavItemWithHoverProps {
  item: NavItem;
  active: boolean;
  onPress: (route: string) => void;
}

const NavItemWithHover: React.FC<NavItemWithHoverProps> = ({ item, active, onPress }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  const color = active ? theme.colors.primary : theme.colors.onSurfaceVariant;

  const bgColor = active
    ? theme.colors.surfaceContainerHigh
    : hovered
      ? theme.colors.surfaceContainer
      : 'transparent';

  return (
    <Pressable
      onPress={() => onPress(item.route)}
      onHoverIn={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onHoverOut={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.rowVertical,
        paddingHorizontal: Spacing.md,
        borderRadius: Spacing.sm,
        marginBottom: Spacing.xs,
        backgroundColor: bgColor,
      }}>
      <Icon size={20} color={color} />
      <NavLabel $active={active}>{item.label}</NavLabel>
    </Pressable>
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

const NavLabel = styled.Text<{ $active: boolean }>`
  font-family: ${({ $active }) => ($active ? Typography.fonts.semibold : Typography.fonts.medium)};
  font-size: ${Typography.sizes.bodyMd}px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.onSurfaceVariant};
  margin-left: ${Spacing.md}px;
`;
