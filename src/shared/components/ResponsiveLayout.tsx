import React from 'react';
import { Platform, View, useWindowDimensions } from 'react-native';
import styled from 'styled-components/native';
import { Sidebar, useSidebarVisible } from '@/shared/components/Sidebar';
import { InsightsPanel } from '@/shared/components/InsightsPanel';
import { useAuthStore } from '@/features/auth/store';

const WIDE_BREAKPOINT = 1200;

export function useInsightsPanelVisible() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' && width >= WIDE_BREAKPOINT;
}

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const sidebarVisible = useSidebarVisible();
  const insightsPanelVisible = useInsightsPanelVisible();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!sidebarVisible || !isAuthenticated) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <OuterContainer>
      <SidebarColumn>
        <Sidebar />
      </SidebarColumn>
      <ContentArea>
        <ContentInner>{children}</ContentInner>
      </ContentArea>
      {insightsPanelVisible && (
        <InsightsPanelColumn>
          <InsightsPanel />
        </InsightsPanelColumn>
      )}
    </OuterContainer>
  );
};

const OuterContainer = styled.View`
  flex: 1;
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SidebarColumn = styled.View`
  height: 100vh;
  position: sticky;
  top: 0;
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
  padding-top: 8px;
`;

const InsightsPanelColumn = styled.View`
  height: 100vh;
  position: sticky;
  top: 0;
`;
