import React from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useLocalSearchParams } from 'expo-router';

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

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams();

  return (
    <Container>
      <Title>Group {groupId}</Title>
    </Container>
  );
}
