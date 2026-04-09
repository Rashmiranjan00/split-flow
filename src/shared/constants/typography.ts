export const Typography = {
  fonts: {
    display: 'System',   // Replace with 'Manrope' once expo-font is configured
    body: 'System',      // Replace with 'Inter'
  },
  sizes: {
    displayLg: 48,
    displayMd: 40,
    displaySm: 32,
    headlineLg: 28,
    headlineMd: 24,
    headlineSm: 22,
    titleLg: 20,
    titleMd: 18,
    titleSm: 16,
    bodyLg: 16,
    bodyMd: 14,
    bodySm: 12,
    labelLg: 14,
    labelMd: 12,
    labelSm: 11,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',   // lowercase alias
    semiBold: '600',   // original camelCase
    bold: '700',
  } as const,
};
