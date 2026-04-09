import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

interface ScreenProps {
  children: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export const Screen: React.FC<ScreenProps> = ({ children, edges = ['top'] }) => {
  const theme = useTheme();

  return (
    <StyledSafeAreaView edges={edges}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      {children}
    </StyledSafeAreaView>
  );
};
