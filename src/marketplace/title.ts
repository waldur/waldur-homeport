import { ENV } from '@/core/config';
import { translate } from '@/i18n';

/**
 * The single name of the marketplace destination.
 *
 * Deployments rename it through MARKETPLACE_LANDING_PAGE, so the sidebar entry,
 * the breadcrumbs, the browser title and the landing hero must all read it from
 * here — otherwise one screen says "Marketplace" while the next says something
 * else. See docs/terminology_policy.md.
 */
export const getMarketplaceTitle = (): string =>
  ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE || translate('Marketplace');
