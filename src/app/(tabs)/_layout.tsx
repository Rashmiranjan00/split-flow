import { Tabs } from 'expo-router';
import { useTheme } from 'styled-components/native';
import { Typography } from '@/shared/constants/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeScreen } from '@/shared/components/Layout';
import { GlassView } from '@/shared/components/GlassView';

const TabsLayout = () => {
  const theme = useTheme();

  return (
    <SafeScreen edges={['top']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 24,
            left: 20,
            right: 20,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            paddingBottom: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
          },
          tabBarBackground: () => (
            <GlassView 
              intensity={30} 
              tint={theme.isDark ? 'dark' : 'light'}
              style={{
                borderRadius: 32,
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant + '40', // Ghost border
                backgroundColor: theme.colors.surface + '90', // Translucent surface
              }}
            />
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarLabelStyle: {
            fontFamily: Typography.fonts.body,
            fontSize: 10,
            marginBottom: 8,
          },
          tabBarIconStyle: {
            marginTop: 8,
          }
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
    </SafeScreen>
  );
};

export default TabsLayout;
