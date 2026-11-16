import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';

// Image is taken from https://www.flickr.com/photos/visitestonia/33974817076
import DefaultHeroImage from './estonian-bog.jpg';

/**
 * URL of the login page hero image: the uploaded one, else the bundled default.
 *
 * The configuration endpoint only sets HERO_IMAGE when an operator uploaded
 * one. Stacking both as CSS layers instead would paint the default through
 * any transparent area of the uploaded image.
 */
export const getHeroImageUrl = (): string =>
  ENV.plugins.WALDUR_CORE.HERO_IMAGE
    ? getIconUrl('hero_image')
    : DefaultHeroImage;

/** CSS `background-image` value for the login page hero. */
export const getHeroBackgroundImage = () => `url(${getHeroImageUrl()})`;
