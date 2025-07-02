import { getIconUrl } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';

// Image is taken from https://www.flickr.com/photos/visitestonia/33974817076
import DefaultHeroImage from './estonian-bog.jpg';
import { HeroButton } from './HeroButton';

import './HeroColumn.css';

export const HeroColumn = () => (
  <div
    className="hero-column"
    style={{
      backgroundImage: `url(${getIconUrl('hero_image')}), url(${DefaultHeroImage})`,
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
