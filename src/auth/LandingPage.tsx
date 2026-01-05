import { useEffect } from 'react';

import { CookiesConsent } from '@waldur/navigation/cookies/CookiesConsent';

import * as AuthService from './AuthService';
import {
  // Classic layouts
  CenteredCardLayout,
  FullHeroLayout,
  GradientLayout,
  MinimalLayout,
  SplitScreenLayout,
  StackedLayout,
  // Visual/Background layouts
  AnimatedGradientLayout,
  GlassmorphismLayout,
  NeumorphismLayout,
  RightSplitLayout,
  VideoBackgroundLayout,
  // Layout Structure layouts
  BottomSheetLayout,
  TabbedLayout,
  WizardLayout,
  // Content-Rich layouts
  CarouselLayout,
  NewsLayout,
  StatsLayout,
  // Brand-Heavy layouts
  BrandPatternLayout,
  DiagonalLayout,
  DuotoneLayout,
  LogoWatermarkLayout,
  // Dynamic layouts
  SeasonalLayout,
  TimeBasedLayout,
  WeatherLayout,
  // Types
  LandingPageLayout,
} from './layouts';
import { useLayoutSwitcher } from './useLayoutSwitcher';

const LayoutComponents: Record<LandingPageLayout, React.ComponentType> = {
  // Classic
  'split-screen': SplitScreenLayout,
  'centered-card': CenteredCardLayout,
  minimal: MinimalLayout,
  'full-hero': FullHeroLayout,
  gradient: GradientLayout,
  stacked: StackedLayout,
  // Visual/Background
  'right-split': RightSplitLayout,
  glassmorphism: GlassmorphismLayout,
  neumorphism: NeumorphismLayout,
  'animated-gradient': AnimatedGradientLayout,
  'video-background': VideoBackgroundLayout,
  // Layout Structure
  'bottom-sheet': BottomSheetLayout,
  tabbed: TabbedLayout,
  wizard: WizardLayout,
  // Content-Rich
  stats: StatsLayout,
  news: NewsLayout,
  carousel: CarouselLayout,
  // Brand-Heavy
  'logo-watermark': LogoWatermarkLayout,
  'brand-pattern': BrandPatternLayout,
  duotone: DuotoneLayout,
  diagonal: DiagonalLayout,
  // Dynamic
  'time-based': TimeBasedLayout,
  seasonal: SeasonalLayout,
  weather: WeatherLayout,
};

export const LandingPage = () => {
  const { layout } = useLayoutSwitcher();

  useEffect(() => AuthService.storeRedirect(), []);

  const LayoutComponent = LayoutComponents[layout];

  return (
    <>
      <CookiesConsent />
      <LayoutComponent />
    </>
  );
};
