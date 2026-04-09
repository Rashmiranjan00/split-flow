import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { useColorScheme } from 'react-native';
import { useAuthStore } from '@/features/auth/store';
import { LuxeDark, LuxeLight } from '@/shared/constants/themes';
import { useThemeStore } from '@/shared/hooks/useThemeStore';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const themeMode = useThemeStore((state) => state.mode);
  const systemScheme = useColorScheme();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme !== 'light');

  const colors = isDark ? LuxeDark : LuxeLight;
  const theme = { colors, isDark };

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            {isAuthenticated ? (
              <Stack.Screen name="(tabs)" />
            ) : (
              <Stack.Screen name="(auth)" />
            )}
            <Stack.Screen name="group/[groupId]" options={{ presentation: 'card' }} />
            <Stack.Screen name="expense/add" options={{ presentation: 'modal' }} />
            <Stack.Screen name="expense/split" options={{ presentation: 'modal' }} />
            <Stack.Screen name="settle/[friendId]" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
