import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isStaff } from '@/workspace/selectors';

/**
 * Catalogue, deploy, and other marketplace shop UI. When
 * hide_marketplace_from_end_users is on, only staff may use these entry points.
 * Project-scoped flows (resource pages, order details for their orders) stay
 * available and are not gated here.
 */
export const canUseMarketplaceShopUi = (
  user: { is_staff?: boolean } | null | undefined,
): boolean => {
  if (!isFeatureVisible(MarketplaceFeatures.hide_marketplace_from_end_users)) {
    return true;
  }
  return !!user?.is_staff;
};

/** UI-Router `data.permissions` guard for marketplace shop routes. */
export const canAccessMarketplaceRouteGuard = (state) =>
  canUseMarketplaceShopUi({ is_staff: isStaff(state) });
