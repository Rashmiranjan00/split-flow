export const Typography = {
  fonts: {
    display: 'System', // Replace with 'Manrope' when custom fonts are loaded
    body: 'System',    // Replace with 'Inter' when custom fonts are loaded
  },
  sizes: {
    displayLg: 56,  // 3.5rem
    headlineMd: 28, // 1.75rem
    titleLg: 22,    // ~1.375rem
    bodyMd: 14,     // 0.875rem
  },
  weights: {
    regular: '400' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
};
