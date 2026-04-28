import {
  UtensilsCrossed,
  Plane,
  ShoppingBag,
  Home,
  Ticket,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react-native';
import type { DefaultTheme } from 'styled-components';

export type CategoryId =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Utilities'
  | 'Entertainment'
  | 'Other';

export interface CategoryConfig {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
}

/**
 * Canonical set of expense categories. Keep this list in sync with
 * {@link file://./../../expenses/components/CategorySelector.tsx}; both UI
 * surfaces read from this single source of truth so the two palettes never
 * drift.
 */
export const CATEGORIES: CategoryConfig[] = [
  { id: 'Food', label: 'Food', icon: UtensilsCrossed },
  { id: 'Travel', label: 'Travel', icon: Plane },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'Utilities', label: 'Utilities', icon: Home },
  { id: 'Entertainment', label: 'Entertainment', icon: Ticket },
  { id: 'Other', label: 'Other', icon: MoreHorizontal },
];

const CATEGORY_MAP: Record<CategoryId, CategoryConfig> = CATEGORIES.reduce(
  (acc, cat) => ({ ...acc, [cat.id]: cat }),
  {} as Record<CategoryId, CategoryConfig>
);

const DEFAULT_CATEGORY_ID: CategoryId = 'Other';

/**
 * Safely coerce an arbitrary string (e.g. legacy `expense.category` values) to
 * one of the known {@link CategoryId} values, falling back to `Other`.
 */
export const toCategoryId = (value?: string | null): CategoryId => {
  if (!value) return DEFAULT_CATEGORY_ID;
  return (CATEGORY_MAP[value as CategoryId]?.id ?? DEFAULT_CATEGORY_ID) as CategoryId;
};

export const getCategoryConfig = (id: string | null | undefined): CategoryConfig =>
  CATEGORY_MAP[toCategoryId(id)];

/**
 * Resolve the theme-aware color for a category chip / pie slice. The palette
 * is picked to read well on the `surfaceContainerLowest` card background.
 */
export const getCategoryColor = (theme: DefaultTheme, id: string | null | undefined): string => {
  const resolved = toCategoryId(id);
  switch (resolved) {
    case 'Food':
      return theme.colors.brandAccent;
    case 'Travel':
      return theme.colors.primary;
    case 'Shopping':
      return theme.colors.secondary;
    case 'Utilities':
      return theme.colors.primaryFixedDim;
    case 'Entertainment':
      return theme.colors.danger;
    case 'Other':
    default:
      return theme.colors.onSurfaceVariant;
  }
};
