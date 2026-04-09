import 'styled-components';
import { ThemeColors } from '@/shared/constants/themes';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: ThemeColors;
    isDark: boolean;
  }
}

// Ensure the same augmentation applies to the native entry point
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: ThemeColors;
    isDark: boolean;
  }
}
