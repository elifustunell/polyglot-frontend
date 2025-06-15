// constants/Theme.ts - Updated with responsive and dark mode support
import { Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Base colors that work for both themes
export const Colors = {
primary: '#007AFF',
secondary: '#5856D6',
success: '#4caf50',
warning: '#ff9800',
error: '#f44336',
info: '#2196f3',

// Light theme defaults (will be overridden by ThemeContext)
background: '#f5f5f5',
surface: '#ffffff',
text: '#333333',
textSecondary: '#666666',
border: '#e0e0e0'
};

// Responsive breakpoints
export const Breakpoints = {
mobile: 768,
tablet: 1024,
desktop: 1200
};

// Helper functions
export const isWeb = Platform.OS === 'web';
export const isMobile = width < Breakpoints.mobile;
export const isTablet = width >= Breakpoints.mobile && width < Breakpoints.tablet;
export const isDesktop = width >= Breakpoints.desktop;

// Responsive sizing
export const getResponsiveSize = (mobile: number, tablet?: number, desktop?: number) => {
if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

// Font sizes
export const FontSizes = {
  xs: getResponsiveSize(12, 13, 14),
  sm: getResponsiveSize(14, 15, 16),
  md: getResponsiveSize(16, 17, 18),
  lg: getResponsiveSize(18, 20, 22),
  xl: getResponsiveSize(20, 22, 24),
  xxl: getResponsiveSize(24, 28, 32),
  xxxl: getResponsiveSize(28, 32, 36)
};

// Spacing
export const Spacing = {
  xs: getResponsiveSize(4, 6, 8),
  sm: getResponsiveSize(8, 12, 16),
  md: getResponsiveSize(16, 20, 24),
  lg: getResponsiveSize(24, 32, 40),
  xl: getResponsiveSize(32, 48, 64),
  xxl: getResponsiveSize(48, 64, 80)
};

// Border radius
export const BorderRadius = {
  sm: getResponsiveSize(6, 8, 10),
  md: getResponsiveSize(8, 10, 12),
  lg: getResponsiveSize(12, 14, 16),
  xl: getResponsiveSize(16, 20, 24)
};

// Global styles - will be enhanced with theme context
export const GlobalStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },

  webContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: Spacing.lg,
    minHeight: '100vh' as any
  },

  whiteBackgroundContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 0
  },

  // Header styles
  headerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface
  },

  headerText: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center' as const
  },

  backButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface
  },

  settingsButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'transparent'
  },

  // Button styles
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
    minHeight: getResponsiveSize(44, 48, 52),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  buttonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600' as const
  },

  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary
  },

  secondaryButtonText: {
    color: Colors.primary,
    fontSize: FontSizes.md,
    fontWeight: '600' as const
  },

  // Form styles
  formGroup: {
    marginBottom: Spacing.lg
  },

  label: {
    fontSize: FontSizes.md,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: Spacing.sm
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: FontSizes.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
    minHeight: getResponsiveSize(44, 48, 52)
  },

  inputFocused: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  // Card styles
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border
  },

  // Typography
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold' as const,
    color: Colors.text,
    textAlign: 'center' as const,
    marginBottom: Spacing.md
  },

  subtitle: {
    fontSize: FontSizes.lg,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: Spacing.sm
  },

  body: {
    fontSize: FontSizes.md,
    color: Colors.text,
    lineHeight: FontSizes.md * 1.4
  },

  caption: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary
  },

  // Grid styles
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.sm,
    justifyContent: 'space-between' as const
  },

  gridItem: {
    width: isWeb ?
      (isDesktop ? 'calc(33.333% - 8px)' : isTablet ? 'calc(50% - 6px)' : '100%') :
      (isMobile ? '48%' : 'calc(33.333% - 8px)') as any
  },

  // List styles
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border
  },

  // Status styles
  successBackground: {
    backgroundColor: Colors.success + '20'
  },

  warningBackground: {
    backgroundColor: Colors.warning + '20'
  },

  errorBackground: {
    backgroundColor: Colors.error + '20'
  },

  infoBackground: {
    backgroundColor: Colors.info + '20'
  },

  // Shadow styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },

  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  }
};

// Function to get theme-aware styles
export const getThemedStyles = (colors: any) => {
  return {
    ...GlobalStyles,

    // Override with theme colors
    container: {
      ...GlobalStyles.container,
      backgroundColor: colors.background
    },

    webContainer: {
      ...GlobalStyles.webContainer,
      backgroundColor: colors.background
    },

    whiteBackgroundContainer: {
      ...GlobalStyles.whiteBackgroundContainer,
      backgroundColor: colors.surface
    },

    headerContainer: {
      ...GlobalStyles.headerContainer,
      backgroundColor: colors.headerBackground
    },

    headerText: {
      ...GlobalStyles.headerText,
      color: colors.text
    },

    backButton: {
      ...GlobalStyles.backButton,
      backgroundColor: colors.surface
    },

    input: {
      ...GlobalStyles.input,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      color: colors.text
    },

    label: {
      ...GlobalStyles.label,
      color: colors.text
    },

    card: {
      ...GlobalStyles.card,
      backgroundColor: colors.surface,
      borderColor: colors.border
    },

    title: {
      ...GlobalStyles.title,
      color: colors.text
    },

    subtitle: {
      ...GlobalStyles.subtitle,
      color: colors.text
    },

    body: {
      ...GlobalStyles.body,
      color: colors.text
    },

    caption: {
      ...GlobalStyles.caption,
      color: colors.textSecondary
    },

    listItem: {
      ...GlobalStyles.listItem,
      backgroundColor: colors.surface,
      borderColor: colors.border
    }
  };
};