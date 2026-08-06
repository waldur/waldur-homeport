import { translate } from '@/i18n';
import { IBreadcrumbItem } from '@/navigation/types';

export const getProviderBreadcrumbItems = (provider): IBreadcrumbItem[] => [
  {
    key: 'marketplace',
    text: translate('Marketplace'),
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

export const PROVIDER_CUSTOMERS_TABLE_TABS = [
  {
    key: 'marketplace-provider-organizations',
    title: translate('Organizations'),
    state: 'marketplace-provider-organizations',
  },
  {
    key: 'marketplace-provider-projects',
    title: translate('Projects'),
    state: 'marketplace-provider-projects',
  },
  {
    key: 'marketplace-provider-users',
    title: translate('Users'),
    state: 'marketplace-provider-users',
  },
];
