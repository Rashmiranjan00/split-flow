import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { Sidebar, useSidebarVisible } from '@/shared/components/Sidebar';
import { useAuthStore } from '@/features/auth/store';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const sidebarVisible = useSidebarVisible();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!sidebarVisible || !isAuthenticated) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <OuterContainer>
      <Sidebar />
      <ContentArea>
        <ContentInner>{children}</ContentInner>
      </ContentArea>
    </OuterContainer>
  );
};

const OuterContainer = styled.View`
  flex: 1;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentArea = styled.View`
  flex: 1;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentInner = styled.View`
  width: 100%;
  max-width: 700px;
  flex: 1;
`;
