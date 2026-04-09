import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/shared/constants/colors';

const StyledSafeAreaView = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

interface ScreenProps {
  children: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export const Screen: React.FC<ScreenProps> = ({ children, edges = ['top'] }) => {
  return (
    <StyledSafeAreaView edges={edges}>
      <StatusBar style="light" />
      {children}
    </StyledSafeAreaView>
  );
};
