import { createTheme } from '@shopify/restyle';

const palette = {
  purple: '#5A31F4',
  white: '#FFF',
  black: '#000',
  darkGray: '#111',
  mediumGray: '#6E6E6E',
  lightGray: '#F5F5F5',
  red: '#EE4B2B',
  blue: '#0077cc',
};

export const theme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardBackground: palette.white,
    primary: palette.blue,
    text: palette.darkGray,
    textMuted: palette.mediumGray,
    error: palette.red,
    border: palette.lightGray,
    white: palette.white,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
  },
  borderRadii: {
    s: 4,
    m: 8,
    l: 16,
  },
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'text',
    },
    subheader: {
      fontSize: 20,
      fontWeight: '600',
      color: 'text',
    },
    body: {
      fontSize: 16,
      color: 'text',
    },
    caption: {
      fontSize: 14,
      color: 'textMuted',
    },
  },
});

export type Theme = typeof theme;

// Helper to make spacing values available as numbers
export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;