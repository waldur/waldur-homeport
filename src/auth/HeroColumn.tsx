import { ENV } from '@/core/config';

import { HeroButton } from './HeroButton';
import { getHeroBackgroundImage } from './heroImage';

import './HeroColumn.css';

export const HeroColumn = () => (
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
    </div>
  </div>
);
