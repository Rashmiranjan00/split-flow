import styled from 'styled-components/native';
import { Typography as TypographyTokens } from '@/shared/constants/typography';

const BaseText = styled.Text`
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: ${TypographyTokens.fonts.body};
`;

/**
 * Display: large screen-level headline. `positive` prop colors the text
 * teal (owed-to-you) or coral (you-owe) for amounts. Unset = default text.
 */
export const Display = styled(BaseText)<{ positive?: boolean }>`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: ${TypographyTokens.sizes.displaySm}px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
  color: ${({ theme, positive }) =>
    positive === undefined
      ? theme.colors.onSurface
      : positive
      ? theme.colors.tertiary
      : theme.colors.error};
`;

export const Headline = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: ${TypographyTokens.sizes.headlineMd}px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -0.5px;
`;

export const Title = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: ${TypographyTokens.sizes.titleMd}px;
  font-weight: ${TypographyTokens.weights.semibold};
`;

export const BodyMd = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.body};
  font-size: ${TypographyTokens.sizes.bodyMd}px;
`;

export const BodySm = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.body};
  font-size: ${TypographyTokens.sizes.bodySm}px;
`;

export const Label = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 12px;
  font-weight: ${TypographyTokens.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

// ---- Warm Minimalist Finance additions ----

/**
 * HeroBalance: 48px/700 balance display. Teal for positive, coral for negative.
 * `positive` is required at call-sites that render an amount.
 */
export const HeroBalance = styled(BaseText)<{ positive?: boolean }>`
  font-family: ${TypographyTokens.fonts.bold};
  font-size: 48px;
  font-weight: ${TypographyTokens.weights.bold};
  letter-spacing: -1.5px;
  line-height: 56px;
  color: ${({ theme, positive }) =>
    positive === undefined
      ? theme.colors.onSurface
      : positive
      ? theme.colors.tertiary
      : theme.colors.danger};
`;

/** SectionLabel: 13/600 UPPERCASE, teal-gray. Used in section headers. */
export const SectionLabel = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 13px;
  font-weight: ${TypographyTokens.weights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

/** RowTitle: 15/500 dark text — transaction / list row titles. */
export const RowTitle = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.medium};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.medium};
  color: ${({ theme }) => theme.colors.onSurface};
`;

/** RowSubtitle: 13/400 gray — metadata / secondary line. */
export const RowSubtitle = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 13px;
  font-weight: ${TypographyTokens.weights.regular};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

/** Timestamp: 11/400 light gray — far-right timestamp on rows. */
export const Timestamp = styled(BaseText)`
  font-family: ${TypographyTokens.fonts.regular};
  font-size: 11px;
  font-weight: ${TypographyTokens.weights.regular};
  color: ${({ theme }) => theme.colors.onSurfaceVariant};
`;

/**
 * Amount: 15/600. Teal for positive (owed to you) and coral for negative
 * (you owe). Default = neutral text color.
 */
export const Amount = styled(BaseText)<{ positive?: boolean }>`
  font-family: ${TypographyTokens.fonts.semibold};
  font-size: 15px;
  font-weight: ${TypographyTokens.weights.semibold};
  color: ${({ theme, positive }) =>
    positive === undefined
      ? theme.colors.onSurface
      : positive
      ? theme.colors.tertiary
      : theme.colors.danger};
`;
