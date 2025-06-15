// constants/ResponsiveTheme.ts - Enhanced responsive theme system
import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const breakpoints = {
mobile: 768,
tablet: 1024,
desktop: 1200
};

// Responsive helper functions
export const isWeb = Platform.OS === 'web';
export const isMobile = width < breakpoints.mobile;
export const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet;
export const isDesktop = width >= breakpoints.desktop;

// Get responsive size based on screen size
export const getResponsiveSize = (mobile: number, tablet?: number, desktop?: number) => {
if (isDesktop && desktop) return desktop;
  if (isTablet && tablet) return tablet;
  return mobile;
};

// Responsive spacing
export const spacing = {
  xs: getResponsiveSize(4, 6, 8),
  sm: getResponsiveSize(8, 12, 16),
  md: getResponsiveSize(16, 20, 24),
  lg: getResponsiveSize(24, 32, 40),
  xl: getResponsiveSize(32, 48, 64),
  xxl: getResponsiveSize(48, 64, 80)
};

// Responsive font sizes
export const fontSize = {
  xs: getResponsiveSize(12, 13, 14),
  sm: getResponsiveSize(14, 15, 16),
  md: getResponsiveSize(16, 17, 18),
  lg: getResponsiveSize(18, 20, 22),
  xl: getResponsiveSize(20, 22, 24),
  xxl: getResponsiveSize(24, 28, 32),
  xxxl: getResponsiveSize(28, 32, 36)
};

// Responsive border radius
export const borderRadius = {
  sm: getResponsiveSize(6, 8, 10),
  md: getResponsiveSize(8, 10, 12),
  lg: getResponsiveSize(12, 14, 16),
  xl: getResponsiveSize(16, 20, 24)
};

// Web-specific styles
export const ResponsiveStyles = {
  // Container styles
  webContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
    minHeight: '100vh' as any
  },

  mobileContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },

  // Card styles
  webCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: isDesktop ? 900 : isTablet ? 700 : 500,
    minHeight: '80vh' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6
  },

  mobileCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: spacing.md
  },

  // Form styles
  webFormGroup: {
    marginBottom: spacing.lg,
    width: '100%'
  },

  mobileFormGroup: {
    marginBottom: spacing.md,
    width: '100%'
  },

  webLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.sm
  },

  mobileLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.xs
  },

  webInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    backgroundColor: '#fff',
    minHeight: 48
  },

  mobileInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.sm,
    backgroundColor: '#fff',
    minHeight: 44
  },

  webInputFocused: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  mobileInputFocused: {
    borderColor: '#007AFF'
  },

  // Button styles
  webButton: {
    backgroundColor: '#007AFF',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    minHeight: 48,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },

  mobileButton: {
    backgroundColor: '#007AFF',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center' as const,
    minHeight: 44
  },

  webButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: '600'
  },

  mobileButtonText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600'
  },

  webButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF'
  },

  mobileButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF'
  },

  webButtonSecondaryText: {
    color: '#007AFF',
    fontSize: fontSize.md,
    fontWeight: '600'
  },

  mobileButtonSecondaryText: {
    color: '#007AFF',
    fontSize: fontSize.sm,
    fontWeight: '600'
  },

  // Typography
  webTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: spacing.md
  },

  mobileTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: spacing.sm
  },

  webSubtitle: {
    fontSize: fontSize.lg,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: spacing.sm
  },

  mobileSubtitle: {
    fontSize: fontSize.md,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: spacing.xs
  },

  // Header styles
  webHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl
  },

  mobileHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg
  },

  // Grid styles
  webGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.lg,
    justifyContent: 'space-between' as const
  },

  mobileGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
    justifyContent: 'space-between' as const
  },

  webGridItem: {
    width: 'calc(50% - 12px)' as any,
    marginBottom: spacing.lg
  },

  mobileGridItem: {
    width: '48%',
    marginBottom: spacing.md
  }
};

// Dark mode responsive styles
export const getResponsiveStylesForTheme = (isDarkMode: boolean) => {
  const backgroundColor = isDarkMode ? '#121212' : '#f5f5f5';
  const cardBackground = isDarkMode ? '#1e1e1e' : '#fff';
  const textColor = isDarkMode ? '#fff' : '#333';
  const secondaryTextColor = isDarkMode ? '#b3b3b3' : '#666';
  const borderColor = isDarkMode ? '#404040' : '#ddd';

  return {
    webContainer: {
      ...ResponsiveStyles.webContainer,
      backgroundColor
    },

    mobileContainer: {
      ...ResponsiveStyles.mobileContainer,
      backgroundColor
    },

    webCard: {
      ...ResponsiveStyles.webCard,
      backgroundColor: cardBackground,
      shadowColor: isDarkMode ? '#000' : '#000'
    },

    mobileCard: {
      ...ResponsiveStyles.mobileCard,
      backgroundColor: cardBackground
    },

    webInput: {
      ...ResponsiveStyles.webInput,
      backgroundColor: cardBackground,
      borderColor,
      color: textColor
    },

    mobileInput: {
      ...ResponsiveStyles.mobileInput,
      backgroundColor: cardBackground,
      borderColor,
      color: textColor
    },

    webLabel: {
      ...ResponsiveStyles.webLabel,
      color: textColor
    },

    mobileLabel: {
      ...ResponsiveStyles.mobileLabel,
      color: textColor
    },

    webTitle: {
      ...ResponsiveStyles.webTitle,
      color: textColor
    },

    mobileTitle: {
      ...ResponsiveStyles.mobileTitle,
      color: textColor
    },

    webSubtitle: {
      ...ResponsiveStyles.webSubtitle,
      color: secondaryTextColor
    },

    mobileSubtitle: {
      ...ResponsiveStyles.mobileSubtitle,
      color: secondaryTextColor
    }
  };
};