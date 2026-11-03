import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { checkIsStaffOrSupport, getUser } from '@/workspace/selectors';
import { User } from '@/workspace/types';

/**
 * Catalogue, deploy, and other marketplace shop UI. When
 * hide_marketplace_from_end_users is on, only staff and support may use these
 * entry points. Provider members and project members stay on their own pages.
 * Project-scoped flows (resource pages, order details for their orders) stay
 * available and are not gated here.
 */
export const canUseMarketplaceShopUi = (
  user: Pick<User, 'is_staff' | 'is_support'> | null | undefined,
): boolean => {
  if (!isFeatureVisible(MarketplaceFeatures.hide_marketplace_from_end_users)) {
    return true;
  }
  // checkIsStaffOrSupport returns the flag itself, which is undefined when
  // neither flag is set. Callers and React Query treat only a real false as off.
  return Boolean(checkIsStaffOrSupport(user as User));
};

/** UI-Router `data.permissions` guard for marketplace shop routes. */
export const canAccessMarketplaceRouteGuard = (state) =>
  canUseMarketplaceShopUi(getUser(state));
