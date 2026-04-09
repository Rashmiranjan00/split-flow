import { Tabs } from 'expo-router';
import { Colors } from '@/shared/constants/colors';
import { Typography } from '@/shared/constants/typography';
import { MaterialIcons } from '@expo/vector-icons';

const TabsLayout = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.surfaceContainerLow,
        borderTopWidth: 0,
        elevation: 0,
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.onSurfaceVariant,
      tabBarLabelStyle: {
        fontFamily: Typography.fonts.body,
        fontSize: 12,
      },
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
      }}
    />
    <Tabs.Screen
      name="groups"
      options={{
        title: 'Groups',
        tabBarIcon: ({ color }) => <MaterialIcons name="group" size={24} color={color} />,
      }}
    />
    <Tabs.Screen
      name="activity"
      options={{
        title: 'Activity',
        tabBarIcon: ({ color }) => <MaterialIcons name="notifications" size={24} color={color} />,
      }}
    />
    <Tabs.Screen
      name="analytics"
      options={{
        title: 'Analytics',
        tabBarIcon: ({ color }) => <MaterialIcons name="insights" size={24} color={color} />,
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
      }}
    />
  </Tabs>
);

export default TabsLayout;
