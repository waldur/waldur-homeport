import { getIconUrl } from '@/core/api';

// Image is taken from https://www.flickr.com/photos/visitestonia/33974817076
import DefaultHeroImage from './estonian-bog.jpg';

/**
 * CSS `background-image` value for the login page hero.
 *
 * `getIconUrl` builds a URL unconditionally, so it can never be used as a
 * truthiness check for "did the operator upload a hero image?" — deployments
 * that did not upload one simply serve 404 for it. Layering the bundled
 * default beneath the configured one lets the browser skip the layer that
 * fails to load and paint the fallback instead, so the hero is never empty.
 *
 * Same idiom as the marketplace and call management landing heroes.
 */
export const getHeroBackgroundImage = () =>
  `url(${getIconUrl('hero_image')}), url(${DefaultHeroImage})`;
