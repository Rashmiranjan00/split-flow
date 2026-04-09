import styled from 'styled-components/native';
import { Colors } from '@/shared/constants/colors';
import { Spacing } from '@/shared/constants/spacing';

export const Screen = styled.SafeAreaView`
  flex: 1;
  background-color: ${Colors.background};
`;

export const Content = styled.ScrollView.attrs(() => ({
  contentContainerStyle: { paddingBottom: 40 },
}))`
  flex: 1;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${Spacing.md}px;
`;

export const SpaceBetweenRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${Spacing.md}px;
`;

export const Column = styled.View`
  flex-direction: column;
`;

interface SpacerProps {
  size?: keyof typeof Spacing;
  horizontal?: boolean;
}

export const Spacer = styled.View<SpacerProps>`
  ${(props: SpacerProps) => {
    const size = props.size || 'md';
    const space = Spacing[size];
    return props.horizontal 
      ? `width: ${space}px;` 
      : `height: ${space}px;`;
  }}
`;
