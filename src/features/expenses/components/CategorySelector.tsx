import React from 'react';
import styled, { useTheme } from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Label } from '@/shared/components/Typography';
import { Radius, Spacing } from '@/shared/constants/spacing';

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding-horizontal: ${Spacing.lg}px;
  gap: ${Spacing.sm}px;
`;

const CategoryCard = styled.TouchableOpacity<{ selected: boolean }>`
  width: 31%;
  aspect-ratio: 1.1;
  background-color: ${({ selected, theme }) => 
    selected ? theme.colors.primaryContainer : theme.colors.surfaceContainerHigh};
  border-radius: ${Radius.md}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : 'transparent'};
`;

const CategoryLabel = styled(Label)<{ selected: boolean }>`
  margin-top: ${Spacing.xs}px;
  font-size: 10px;
  color: ${({ selected, theme }) => 
    selected ? theme.colors.primary : theme.colors.onSurfaceVariant};
  font-weight: ${({ selected }) => (selected ? '700' : '400')};
`;

const CATEGORIES = [
  { id: 'Food', icon: 'restaurant' as const },
  { id: 'Travel', icon: 'flight' as const },
  { id: 'Shopping', icon: 'shopping-bag' as const },
  { id: 'Utilities', icon: 'home' as const },
  { id: 'Entertainment', icon: 'confirmation-number' as const },
  { id: 'Other', icon: 'more-horiz' as const },
];

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Container>
      {CATEGORIES.map((cat) => (
        <CategoryCard
          key={cat.id}
          selected={selectedCategory === cat.id}
          activeOpacity={0.7}
          onPress={() => onSelect(cat.id)}
        >
          <MaterialIcons 
            name={cat.icon} 
            size={24} 
            color={selectedCategory === cat.id ? theme.colors.primary : theme.colors.onSurfaceVariant} 
          />
          <CategoryLabel selected={selectedCategory === cat.id}>
            {cat.id.toUpperCase()}
          </CategoryLabel>
        </CategoryCard>
      ))}
    </Container>
  );
};
