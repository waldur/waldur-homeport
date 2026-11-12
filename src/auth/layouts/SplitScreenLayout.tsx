import { HeroColumn } from '../HeroColumn';
import { LoginColumn } from '../LoginColumn';

import './SplitScreenLayout.css';

export const SplitScreenLayout = () => {
  return (
    <div className="layout-split-screen">
      <LoginColumn />
      <HeroColumn />
    </div>
  );
};
