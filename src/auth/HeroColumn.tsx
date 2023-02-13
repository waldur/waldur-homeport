import { ENV } from '@waldur/configs/default';
import { formatMediaURL } from '@waldur/core/utils';

import { HeroButton } from './HeroButton';

// Image is taken from https://www.flickr.com/photos/visitestonia/33974817076
const DefaultHeroImage = require('./estonian-bog.jpg');

import './HeroColumn.css';

export const HeroColumn = () => (
  <div
    className="HeroColumn"
    style={{
      backgroundImage: `url(${
        formatMediaURL(ENV.plugins.WALDUR_CORE.HERO_IMAGE) || DefaultHeroImage
      })`,
    }}
  >
    <div className="HeroBackground">
      <div className="HeroText">
        <h1>{ENV.plugins.WALDUR_CORE.SITE_DESCRIPTION}</h1>
        <HeroButton />
      </div>
    </div>
  </div>
);
