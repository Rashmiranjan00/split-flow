import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { ExpenseCard } from '@/components/ExpenseCard';

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

export default function ActivityScreen() {
  return (
    <Container>
      <Content showsVerticalScrollIndicator={false}>
        <Header>Activity</Header>
        <ExpenseCard 
          title="Payment from Sarah" 
          subtitle="Settled Trip Balance" 
          amount={12.50} 
          date="2 hours ago" 
          onPress={() => {}} 
          highlighted 
        />
        <ExpenseCard 
          title="Added to Apartment" 
          subtitle="You were added" 
          amount={0} 
          date="Yesterday" 
          onPress={() => {}} 
        />
      </Content>
    </Container>
  );
}
