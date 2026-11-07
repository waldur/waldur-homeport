import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isMarketplaceVisible } from '@/marketplace/serviceAccessMode';
import { checkIsStaffOrSupport, getUser } from '@/workspace/selectors';
import { User } from '@/workspace/types';

type ShopUser = Pick<User, 'is_staff' | 'is_support'> | null | undefined;

/**
 * An offering's own pages: its public page and its deploy form. Hidden from end
 * users together with the shop when hide_marketplace_from_end_users is on: only
 * staff and support see them then. Provider members and project members stay
 * on their own pages. Calls-only mode leaves them open, so a link to one checks
 * this rather than canUseMarketplaceShopUi.
 */
export const canViewOfferingPages = (user: ShopUser): boolean =>
  !isFeatureVisible(MarketplaceFeatures.hide_marketplace_from_end_users) ||
  // checkIsStaffOrSupport returns the flag itself, which is undefined when
  // neither flag is set. Callers and React Query treat only a real false as off.
  Boolean(checkIsStaffOrSupport(user as User));

/**
 * Catalogue, deploy, and other marketplace shop UI. When
 * hide_marketplace_from_end_users is on, only staff and support may use these
 * entry points; when the deployment runs calls only, only staff. Project-scoped
 * flows (resource pages, order details for their orders) stay available and are
 * not gated here.
 */
export const canUseMarketplaceShopUi = (user: ShopUser): boolean =>
  canViewOfferingPages(user) && (isMarketplaceVisible() || !!user?.is_staff);

/**
 * Ordering from one offering. Calls-only mode closes the shop but not private
 * offerings, such as an OpenStack tenant's instance and volume offerings: they
 * draw on an allocation the project already holds.
 */
export const canOrderFromOffering = (
  user: ShopUser,
  offering: { shared?: boolean } | null | undefined,
): boolean =>
  offering?.shared === false
    ? canViewOfferingPages(user)
    : canUseMarketplaceShopUi(user);

/** UI-Router `data.permissions` guard for marketplace shop routes. */
export const canAccessMarketplaceRouteGuard = (state) =>
  canUseMarketplaceShopUi(getUser(state));

/**
 * UI-Router `data.permissions` guard for an offering's own page. Calls-only
 * mode keeps it out of the shop: the offerings its calls list link to it, and
 * the page applies through a call there. The deploy form uses it too and checks
 * `canOrderFromOffering` once the offering is loaded.
 */
export const canAccessOfferingPageRouteGuard = (state) =>
  canViewOfferingPages(getUser(state));
