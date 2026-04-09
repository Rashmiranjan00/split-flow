import { Stack } from 'expo-router';
import { useTheme } from 'styled-components/native';

const AuthLayout = () => {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
};

export default AuthLayout;
