import React, { useState, useCallback } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { Home, Users, Contact, Bell, User } from 'lucide-react-native';
import { Typography } from '@/shared/constants/typography';
import { SafeScreen } from '@/shared/components/Layout';
import { GlobalFAB } from '@/shared/components/GlobalFAB';
import { ContextPickerSheet } from '@/features/expenses/components/ContextPickerSheet';

const TabsLayout = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sheetVisible, setSheetVisible] = useState(false);

  const isProfileTab = pathname === '/profile';

  const handleFABPress = useCallback(() => {
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleSelectGroup = useCallback(
    (groupId: string) => {
      setSheetVisible(false);
      router.push({ pathname: '/expense/add', params: { groupId } });
    },
    [router]
  );

  const handleSelectFriend = useCallback(
    (friendId: string) => {
      setSheetVisible(false);
      router.push({ pathname: '/expense/add', params: { friendId } });
    },
    [router]
  );

  return (
    <SafeScreen edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.surfaceContainerLowest,
            borderTopWidth: 0.5,
            borderTopColor: theme.colors.divider,
            height: 68,
            paddingTop: 8,
            paddingBottom: 12,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontFamily: Typography.fonts.medium,
            fontSize: 10,
            marginBottom: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => <Users size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color }) => <Contact size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => <Bell size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} />,
          }}
        />
      </Tabs>

      {!isProfileTab && !sheetVisible && <GlobalFAB onPress={handleFABPress} />}

      <ContextPickerSheet
        visible={sheetVisible}
        onClose={handleSheetClose}
        onSelectGroup={handleSelectGroup}
        onSelectFriend={handleSelectFriend}
      />
    </SafeScreen>
  );
};

export default TabsLayout;
