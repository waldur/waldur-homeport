import { DiscountTypeEnum } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { CampaignFormData } from '@waldur/marketplace/service-providers/types';
import { IBreadcrumbItem } from '@waldur/navigation/types';

export const serializeCampaign = (formData: CampaignFormData) => ({
  name: formData.name,
  discount_type: formData.discount_type as DiscountTypeEnum,
  discount: formData.discount,
  start_date: formData.start_date,
  end_date: formData.end_date,
  stock: formData.stock,
  auto_apply: formData.auto_apply,
  service_provider: formData.service_provider.url,
  offerings: formData.offerings.map((offering) => offering.uuid),
});

export const getProviderBreadcrumbItems = (provider): IBreadcrumbItem[] => [
  {
    key: 'marketplace',
    text: 'Marketplace',
    to: 'public.marketplace-landing',
  },
  {
    key: 'service-providers',
    text: 'Service providers',
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
