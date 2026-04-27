import React from 'react';
import styled from 'styled-components/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Radius, Spacing } from '@/shared/constants/spacing';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

const Container = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 0 ${Spacing.screenPadding}px;
  gap: ${Spacing.sm}px;
`;

const CategoryCard = styled.TouchableOpacity<{ selected: boolean }>`
  width: 31%;
  aspect-ratio: 1.3;
  background-color: ${({ selected, theme }: { selected: boolean; theme: any }) =>
    selected ? theme.colors.primaryFixedDim : theme.colors.surfaceContainerLowest};
  border-radius: ${Radius.md}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${({ selected, theme }: { selected: boolean; theme: any }) =>
    selected ? theme.colors.primary : theme.colors.divider};
`;

const CategoryText = styled.Text<{ selected: boolean }>`
  margin-top: ${Spacing.xs}px;
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 11px;
  color: ${({ selected, theme }: { selected: boolean; theme: any }) =>
    selected ? theme.colors.brandDark : theme.colors.onSurfaceVariant};
  font-weight: ${({ selected }: { selected: boolean }) =>
    selected ? TypographyTokens.weights.semibold : TypographyTokens.weights.medium};
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
  return (
    <Container>
      {CATEGORIES.map((cat) => {
        const selected = selectedCategory === cat.id;
        return (
          <CategoryCard
            key={cat.id}
            selected={selected}
            activeOpacity={0.7}
            onPress={() => onSelect(cat.id)}
          >
            <MaterialIcons
              name={cat.icon}
              size={22}
              color={selected ? '#004D38' : '#6C7A72'}
            />
            <CategoryText selected={selected}>{cat.id}</CategoryText>
          </CategoryCard>
        );
      })}
    </Container>
  );
};
