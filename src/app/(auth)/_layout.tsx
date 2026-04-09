import { Stack } from 'expo-router';
import { Colors } from '@/shared/constants/colors';

const AuthLayout = () => (
  <Stack
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background },
    }}
  />
);

export default AuthLayout;
