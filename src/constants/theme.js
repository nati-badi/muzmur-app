const THEMES = {
  classic: {
    id: 'classic',
    name: 'ክላሲክ',
    primary: '#4E2416', // Deep Brown
    accent: '#D4AF37',  // Gold
    background: '#F9F9F7',
    surface: '#FFFFFF',
    text: '#2C2C2C',
    textSecondary: '#666666',
    playerBackground: '#4E2416',
    playerText: '#FFFFFF',
    playerAccent: '#D4AF37',
    swatches: ['#8B4513', '#4E2416', '#D4AF37'],
    error: '#B00020',
    success: '#2ECC71',
    borderColor: 'rgba(78, 36, 22, 0.1)'
  },
  green: {
    id: 'green',
    name: 'አረንጓዴ',
    primary: '#0B4D2C', // Deep Forest Green
    accent: '#2ECC71',  // Emerald Green
    background: '#F7F9F8',
    surface: '#FFFFFF',
    text: '#1A2F25',
    textSecondary: '#5A7366',
    playerBackground: '#0B4D2C',
    playerText: '#FFFFFF',
    playerAccent: '#2ECC71',
    swatches: ['#1A5D3B', '#0B4D2C', '#2ECC71'],
    error: '#B00020',
    success: '#2ECC71',
    borderColor: 'rgba(11, 77, 44, 0.1)'
  },
  blue: {
    id: 'blue',
    name: 'ሰማያዊ',
    primary: '#1A237E', // Spiritual Navy
    accent: '#2979FF',  // Digital Blue
    background: '#F7F8F9',
    surface: '#FFFFFF',
    text: '#1A1C2E',
    textSecondary: '#575A7A',
    playerBackground: '#1A237E',
    playerText: '#FFFFFF',
    playerAccent: '#2979FF',
    swatches: ['#283593', '#1A237E', '#2979FF'],
    error: '#B00020',
    success: '#2ECC71',
    borderColor: 'rgba(26, 35, 126, 0.1)'
  },
  purple: {
    id: 'purple',
    name: 'ወይን ጠጅ',
    primary: '#4A148C', // Deep Royal Purple
    accent: '#AA00FF',  // Electric Purple
    background: '#F9F7F9',
    surface: '#FFFFFF',
    text: '#2E1A2F',
    textSecondary: '#7A577C',
    playerBackground: '#4A148C',
    playerText: '#FFFFFF',
    playerAccent: '#AA00FF',
    swatches: ['#6A1B9A', '#4A148C', '#AA00FF'],
    error: '#B00020',
    success: '#2ECC71',
    borderColor: 'rgba(74, 20, 140, 0.1)'
  }
};

const COLORS = THEMES.classic; // Default fallback

const TEXT = {
  title: {
    fontWeight: '600'
  },
  lyric: {
    fontWeight: '400',
    fontSize: 16
  }
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
