import { useBreakpointUp } from 'waldur-ui';

import { HeroColumn } from '../HeroColumn';
import { LoginColumn } from '../LoginColumn';

import './RightSplitLayout.css';

export const RightSplitLayout = () => {
  // Side by side (the same 768px as RightSplitLayout.css), the demo users get
  // the hero column. Stacked, the hero column comes first and fills the
  // screen, so they stay with the sign-in methods below it.
  const sideBySide = useBreakpointUp('md');
  return (
    <div className="layout-right-split">
      <HeroColumn showDemoUsers={sideBySide} />
      <LoginColumn showDemoUsers={!sideBySide} />
    </div>
  );
};
