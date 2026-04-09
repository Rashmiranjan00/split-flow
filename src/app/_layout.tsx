import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components/native';
import { useAuthStore } from '@/features/auth/store';
import { Colors } from '@/shared/constants/colors';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient();

const RootLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={{ colors: Colors }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
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
  );
};

export default RootLayout;
