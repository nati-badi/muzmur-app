const { createTamagui, createFont, createTokens } = require('tamagui');
const { config } = require('@tamagui/config/v3');

// 1. Define Tokens (Colors, Spacing, etc.)
const tokens = createTokens({
  ...config.tokens,
  color: {
    ...config.tokens.color,
    primary: '#8B4513',
    accent: '#D4AF37',
    background: '#F9F9F7',
    surface: '#FFFFFF',
    text: '#2C2C2C',
    textSecondary: '#666666',
    error: '#B00020',
    success: '#2ECC71',
    border: '#E0E0E0',
  },
});

// 2. Define Fonts
const interFont = createFont({
  family: 'Inter',
  size: {
    1: 12,
    2: 14,
    3: 15,
    4: 16,
    5: 18,
    6: 20,
    7: 24,
    8: 28,
    9: 32,
    10: 40,
    11: 48,
    12: 64,
  },
  lineHeight: {
    1: 17,
    2: 19,
    3: 20,
    4: 21,
    5: 23,
    6: 25,
    7: 29,
    8: 33,
    9: 37,
    10: 45,
    11: 53,
    12: 69,
  },
  weight: {
    4: '400',
    6: '600',
    7: '700',
  },
  letterSpacing: {
    4: 0,
    7: -1,
  },
  face: {
    400: { normal: 'Inter_400Regular' },
    600: { normal: 'Inter_600SemiBold' },
    700: { normal: 'Inter_700Bold' },
  },
});

const ethiopicFont = createFont({
  family: 'NotoSansEthiopic',
  size: interFont.size,
  lineHeight: {
    1: 20,
    2: 24,
    3: 26,
    4: 28,
    5: 32,
    6: 36,
    7: 42,
    8: 48,
    9: 54,
    10: 64,
  },
  weight: {
    4: '400',
    7: '700',
  },
  face: {
    400: { normal: 'NotoSansEthiopic_400Regular' },
    700: { normal: 'NotoSansEthiopic_700Bold' },
  },
});

const ethiopicSerifFont = createFont({
  family: 'NotoSerifEthiopic',
  size: interFont.size,
  lineHeight: ethiopicFont.lineHeight,
  weight: {
    4: '400',
    7: '700',
  },
  face: {
    400: { normal: 'NotoSerifEthiopic_400Regular' },
    700: { normal: 'NotoSerifEthiopic_700Bold' },
  },
});

// 3. Define Themes
const light = {
  background: tokens.color.background,
  color: tokens.color.text,
  colorSecondary: tokens.color.textSecondary,
  borderColor: tokens.color.border,
  primary: tokens.color.primary,
  accentColor: tokens.color.accent,
  surface: tokens.color.surface,
};

const dark = {
  background: '#121212',
  color: '#FFFFFF',
  colorSecondary: '#A0A0A0',
  borderColor: '#333333',
  primary: '#D4AF37', // Gold accent for dark mode
  accentColor: '#8B4513',
  surface: '#1E1E1E',
};

// 4. Create Tamagui Config
const tamaguiConfig = createTamagui({
  ...config,
  fonts: {
    heading: interFont,
    body: interFont,
    ethiopic: ethiopicFont,
    ethiopicSerif: ethiopicSerifFont,
  },
  tokens,
  themes: {
    light,
    dark,
  },
});

module.exports = tamaguiConfig;
