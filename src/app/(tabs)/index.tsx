import React from 'react';
import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { BalanceCard } from '@/components/BalanceCard';
import { ExpenseCard } from '@/components/ExpenseCard';
import { useAuthStore } from '@/features/auth/store';
import { useRouter } from 'expo-router';
import { ActionButton } from '@/components/ActionButton';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${Colors.background};
`;

const Content = styled.ScrollView`
  padding: ${Spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${Spacing.xl}px;
`;

const Greeting = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
`;

const SectionTitle = styled.Text`
  color: ${Colors.onSurface};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
  font-weight: ${Typography.weights.bold};
  margin-vertical: ${Spacing.md}px;
`;

const FloatingActionWrapper = styled.View`
  position: absolute;
  bottom: ${Spacing.lg}px;
  align-self: center;
  shadow-color: ${Colors.primaryFixedDim};
  shadow-offset: 0px 24px;
  shadow-opacity: 0.06;
  shadow-radius: 48px;
  elevation: 8;
`;

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  return (
    <>
      <Container>
        <Content showsVerticalScrollIndicator={false}>
          <Header>
            <Greeting>Hello, {user?.name?.split(' ')[0]}</Greeting>
          </Header>
          
          <BalanceCard totalBalance={124.50} />
          
          <SectionTitle>Recent Activity</SectionTitle>
          <ExpenseCard 
            title="Dinner at Nobu" 
            subtitle="You paid • Group Trip" 
            amount={-45.20} 
            date="Today" 
            onPress={() => {}} 
          />
          <ExpenseCard 
            title="Uber to Airport" 
            subtitle="Sarah paid • Group Trip" 
            amount={12.50} 
            date="Yesterday" 
            onPress={() => {}} 
            highlighted 
          />
        </Content>
      </Container>
      <FloatingActionWrapper>
        <ActionButton 
          title="+" 
          onPress={() => router.push('/expense/add')} 
        />
      </FloatingActionWrapper>
    </>
  );
}
