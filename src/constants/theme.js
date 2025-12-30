const THEMES = {
  classic: {
    id: 'classic',
    name: 'ክላሲክ',
    primary: '#45271E', // Heritage Mahogany
    accent: '#C5A028',  // Antique Gold
    background: '#F9F9F7',
    surface: '#FFFFFF',
    text: '#2C2B2A',
    textSecondary: '#6D6A66',
    playerBackground: '#45271E',
    playerText: '#FFFFFF',
    playerAccent: '#C5A028',
    swatches: ['#45271E', '#734D41', '#C5A028'],
    error: '#B03A2E',
    success: '#27AE60',
    borderColor: 'rgba(69, 39, 30, 0.08)'
  },
  forest: {
    id: 'forest',
    name: 'አረንጓዴ',
    primary: '#1B3B2B', // Evergreen
    accent: '#4A8B6F',  // Sage Emerald
    background: '#F5F7F6',
    surface: '#FFFFFF',
    text: '#1A2922',
    textSecondary: '#5A7366',
    playerBackground: '#1B3B2B',
    playerText: '#FFFFFF',
    playerAccent: '#4A8B6F',
    swatches: ['#1B3B2B', '#345E49', '#4A8B6F'],
    error: '#B03A2E',
    success: '#27AE60',
    borderColor: 'rgba(27, 59, 43, 0.08)'
  },
  serene: {
    id: 'serene',
    name: 'ሰማያዊ',
    primary: '#2C3E50', // Slate Navy
    accent: '#5D80A6',  // Muted Steel Blue
    background: '#F4F7F9',
    surface: '#FFFFFF',
    text: '#1C2833',
    textSecondary: '#5D6D7E',
    playerBackground: '#2C3E50',
    playerText: '#FFFFFF',
    playerAccent: '#5D80A6',
    swatches: ['#2C3E50', '#4A647E', '#5D80A6'],
    error: '#B03A2E',
    success: '#27AE60',
    borderColor: 'rgba(44, 62, 80, 0.08)'
  },
  royal: {
    id: 'royal',
    name: 'ወይን ጠጅ',
    primary: '#3B1E54', // Byzantine Purple
    accent: '#8E6F9F',  // Muted Mauve
    background: '#F7F4F9',
    surface: '#FFFFFF',
    text: '#24142E',
    textSecondary: '#6D5D7E',
    playerBackground: '#3B1E54',
    playerText: '#FFFFFF',
    playerAccent: '#8E6F9F',
    swatches: ['#3B1E54', '#5D3B73', '#8E6F9F'],
    error: '#B03A2E',
    success: '#27AE60',
    borderColor: 'rgba(59, 30, 84, 0.08)'
  },
  rose: {
    id: 'rose',
    name: 'ሮዝ',
    primary: '#5D2E46', // Burgundy
    accent: '#E098AD',  // Dusty Rose
    background: '#F9F5F6',
    surface: '#FFFFFF',
    text: '#3D1F2E',
    textSecondary: '#7A5C6B',
    playerBackground: '#5D2E46',
    playerText: '#FFFFFF',
    playerAccent: '#E098AD',
    swatches: ['#5D2E46', '#8E4A6F', '#E098AD'],
    error: '#B03A2E',
    success: '#27AE60',
    borderColor: 'rgba(93, 46, 70, 0.08)'
  }
};

const COLORS = THEMES.classic;

const TEXT = {
  title: { fontWeight: '600' },
  lyric: { fontWeight: '400', fontSize: 16 }
};

const FONTS = {
  regular: 'System',
  bold: 'System',
  size: {
    small: 14,
    medium: 16,
    large: 20,
    xlarge: 24,
    xxlarge: 32,
  },
};

const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

module.exports = {
  THEMES,
  COLORS,
  TEXT,
  FONTS,
  SPACING,
};
