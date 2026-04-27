import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { useAuthStore } from '@/features/auth/store';
import { ClearLight } from '@/shared/constants/themes';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

const queryClient = new QueryClient();

import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in dev fast-refresh; swallow the warning.
});

/**
 * The "Warm Minimalist Finance" revamp is light-mode-only. We keep the
 * theme toggle UI functional inside Profile, but the app always renders
 * with the ClearLight palette. Dark mode is intentionally out of scope
 * for this revamp.
 */
const RootLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const theme = { colors: ClearLight, isDark: false };

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: ClearLight.background },
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
