// hooks/useResponsiveLayout.ts - Enhanced responsive layout hook
import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import {
breakpoints,
spacing,
fontSize,
borderRadius,
getResponsiveSize
} from '@/constants/ResponsiveTheme';

interface ResponsiveLayout {
isWeb: boolean;
isMobile: boolean;
isTablet: boolean;
isDesktop: boolean;
screenWidth: number;
screenHeight: number;

// Spacing
spacing: typeof spacing;

// Typography
fontSize: typeof fontSize;

// Border radius
borderRadius: typeof borderRadius;

// Button dimensions
buttonWidth: number | string;
buttonHeight: number;

// Container dimensions
containerMaxWidth: number | string;
containerPadding: number;

// Grid dimensions
gridGap: number;
gridItemWidth: string;

// Card dimensions
cardPadding: number;
cardMargin: number;

// Header dimensions
headerPadding: number;
headerMargin: number;

// Safe area considerations
safeAreaTop: number;
safeAreaBottom: number;
}

export const useResponsiveLayout = (): ResponsiveLayout => {
const [dimensions, setDimensions] = useState(() => {
const { width, height } = Dimensions.get('window');
return { width, height };
});

useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  // Device type detection
  const isWeb = Platform.OS === 'web';
  const isMobile = width < breakpoints.mobile;
  const isTablet = width >= breakpoints.mobile && width < breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;

  // Button dimensions
  const buttonWidth = isWeb ?
    (isDesktop ? 320 : isTablet ? 280 : 240) :
    '100%';
  const buttonHeight = getResponsiveSize(44, 48, 52);

  // Container dimensions
  const containerMaxWidth = isWeb ?
    (isDesktop ? 1200 : isTablet ? 900 : 600) :
    '100%';
  const containerPadding = getResponsiveSize(16, 20, 24);

  // Grid dimensions
  const gridGap = getResponsiveSize(12, 16, 20);
  const gridItemWidth = isWeb ?
    (isDesktop ? 'calc(33.333% - 14px)' : isTablet ? 'calc(50% - 10px)' : '100%') :
    (isMobile ? '48%' : 'calc(33.333% - 8px)');

  // Card dimensions
  const cardPadding = getResponsiveSize(16, 20, 24);
  const cardMargin = getResponsiveSize(16, 20, 24);

  // Header dimensions
  const headerPadding = getResponsiveSize(16, 20, 24);
  const headerMargin = getResponsiveSize(16, 20, 24);

  // Safe area (for mobile apps with notches)
  const safeAreaTop = Platform.OS === 'ios' ? 44 : 24;
  const safeAreaBottom = Platform.OS === 'ios' ? 34 : 0;

  return {
    isWeb,
    isMobile,
    isTablet,
    isDesktop,
    screenWidth: width,
    screenHeight: height,

    spacing,
    fontSize,
    borderRadius,

    buttonWidth,
    buttonHeight,

    containerMaxWidth,
    containerPadding,

    gridGap,
    gridItemWidth,

    cardPadding,
    cardMargin,

    headerPadding,
    headerMargin,

    safeAreaTop,
    safeAreaBottom
  };
};