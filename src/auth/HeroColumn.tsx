import { useBreakpointUp } from 'waldur-ui';

import { ENV } from '@/core/config';

import { DemoUserQuickLogin } from './DemoUserQuickLogin';
import { HeroButton } from './HeroButton';
import { getHeroBackgroundImage } from './heroImage';
import { useAuthFeatures } from './useAuthFeatures';

import './HeroColumn.css';

export const HeroColumn = () => {
  const features = useAuthFeatures();
  // Beside the sign-in column the demo users get a card of their own here;
  // on a narrow screen the column stacks below the fold, and LoginColumn
  // lists them under the sign-in methods instead.
  const isWide = useBreakpointUp('md');

  return (
    <div
      className="hero-column"
      style={{
        backgroundImage: getHeroBackgroundImage(),
      }}
    >
      <div className="hero-background">
        <div className="hero-text">
          <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
          <HeroButton />
        </div>
        {features.SigninForm && isWide && (
          <DemoUserQuickLogin variant="card" className="mt-8" />
        )}
      </div>
    </div>
  );
};
