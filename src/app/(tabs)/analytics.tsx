import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  padding: ${Spacing.lg}px;
`;

const Header = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.displayLg}px;
  font-weight: ${Typography.weights.bold};
  margin-bottom: ${Spacing.xl}px;
  letter-spacing: -2px;
`;

const ComingSoon = styled.View`
  padding: ${Spacing.xxl}px;
  align-items: center;
  justify-content: center;
`;

const TextDesc = styled.Text`
  color: ${Colors.onSurfaceVariant};
  font-family: ${Typography.fonts.body};
  font-size: ${Typography.sizes.bodyMd}px;
`;

export default function AnalyticsScreen() {
  return (
    <Container>
      <Content showsVerticalScrollIndicator={false}>
        <Header>Insights</Header>
        <ComingSoon>
          <TextDesc>Activity charts coming soon...</TextDesc>
        </ComingSoon>
      </Content>
    </Container>
  );
}
