import { useBreakpointUp } from 'waldur-ui';

import { HeroColumn } from '../HeroColumn';
import { LoginColumn } from '../LoginColumn';

import './SplitScreenLayout.css';

export const SplitScreenLayout = () => {
  // Side by side (the same 768px as SplitScreenLayout.css), the demo users
  // get the hero column, so the sign-in column keeps to its methods. Stacked,
  // the hero column is below the fold, and they stay with the methods.
  const sideBySide = useBreakpointUp('md');
  return (
    <div className="layout-split-screen">
      <LoginColumn showDemoUsers={!sideBySide} />
      <HeroColumn showDemoUsers={sideBySide} />
    </div>
  );
};
