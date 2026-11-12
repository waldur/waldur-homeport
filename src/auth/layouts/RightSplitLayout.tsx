import { HeroColumn } from '../HeroColumn';
import { LoginColumn } from '../LoginColumn';

import './RightSplitLayout.css';

export const RightSplitLayout = () => {
  return (
    <div className="layout-right-split">
      <HeroColumn />
      <LoginColumn />
    </div>
  );
};
