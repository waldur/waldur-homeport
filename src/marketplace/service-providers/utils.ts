import { translate } from '@/i18n';
import { IBreadcrumbItem } from '@/navigation/types';
import { PermissionEnum } from '@/permissions/enums';

import { getMarketplaceTitle } from '../title';

export const getProviderBreadcrumbItems = (provider): IBreadcrumbItem[] => [
  {
    key: 'marketplace',
    text: getMarketplaceTitle(),
    to: 'public.marketplace-landing',
  },
  {
    key: 'service-providers',
    text: translate('Service providers'),
    to: 'public.marketplace-providers',
  },
  {
    key: 'provider',
    text: provider.customer_name,
    active: true,
  },
];

// Each list asks Mastermind for a different provider permission, and a custom
// provider role may hold only some of them: see useProviderCustomersTabs.
export const PROVIDER_CUSTOMERS_TABLE_TABS = [
  {
    key: 'marketplace-provider-organizations',
    title: translate('Organizations'),
    state: 'marketplace-provider-organizations',
    permission: PermissionEnum.LIST_SERVICE_PROVIDER_CUSTOMERS,
  },
  {
    key: 'marketplace-provider-projects',
    title: translate('Projects'),
    state: 'marketplace-provider-projects',
    permission: PermissionEnum.LIST_SERVICE_PROVIDER_PROJECTS,
  },
  {
    key: 'marketplace-provider-users',
    title: translate('Users'),
    state: 'marketplace-provider-users',
    permission: PermissionEnum.LIST_SERVICE_PROVIDER_USERS,
  },
];
