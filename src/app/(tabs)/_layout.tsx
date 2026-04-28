import { Tabs } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { Home, Users, Contact, Bell, User } from 'lucide-react-native';
import { Typography } from '@/shared/constants/typography';
import { SafeScreen } from '@/shared/components/Layout';

const TabsLayout = () => {
  const theme = useTheme();

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
        }}
      >
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
    </SafeScreen>
  );
};

export default TabsLayout;
