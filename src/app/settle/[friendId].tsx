import React from 'react';
import styled from 'styled-components/native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

const Container = styled.View`
  flex: 1;
  background-color: ${Colors.background};
  align-items: center;
  justify-content: center;
`;

const Title = styled.Text`
  color: ${Colors.primary};
  font-family: ${Typography.fonts.display};
  font-size: ${Typography.sizes.titleLg}px;
`;

const SettleScreen = () => {
  const { friendId } = useLocalSearchParams();

  return (
    <Container>
      <Title>Settle with {friendId}</Title>
    </Container>
  );
};

export default SettleScreen;
