import { CSSProperties, FC } from 'react';

import { ENV } from '@/core/config';

import { DemoUserQuickLogin } from './DemoUserQuickLogin';
import { HeroButton } from './HeroButton';
import { getHeroBackgroundImage } from './heroImage';
import { useAuthFeatures } from './useAuthFeatures';

import './HeroColumn.css';

interface HeroColumnProps {
  /**
   * Show the demo users as a card under the text. The layout decides, and
   * passes it only where this column sits beside the sign-in column.
   */
  showDemoUsers?: boolean;
}

export const HeroColumn: FC<HeroColumnProps> = ({ showDemoUsers = false }) => {
  const features = useAuthFeatures();

  return (
    <div
      className="hero-column"
      data-testid="hero-column"
      // HeroColumn.css layers the overlay over it.
      style={{ '--hero-image': getHeroBackgroundImage() } as CSSProperties}
    >
      <div className="hero-background">
        <div className="hero-text">
          <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
          <HeroButton />
        </div>
        {features.SigninForm && showDemoUsers && (
          <DemoUserQuickLogin variant="card" className="mt-8" />
        )}
      </div>
    </div>
  );
};
