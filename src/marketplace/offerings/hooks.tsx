import { Offering, ServiceProvider } from 'waldur-js-client';

import { translate } from '@/i18n';
import { IBreadcrumbItem } from '@/navigation/types';

import { OfferingBreadcrumbPopover } from './OfferingBreadcrumbPopover';

export const getOfferingBreadcrumbItems = (
  offering: Offering,
  provider: ServiceProvider,
  page: 'details' | 'edit',
): IBreadcrumbItem[] => {
  return [
    {
      key: 'marketplace',
      text: translate('Marketplace'),
      to: 'public.marketplace-landing',
    },
    {
      key: 'service-provider',
      text: offering?.customer_name || '...',
      to: 'marketplace-providers.details',
      params: offering ? { customer_uuid: offering.customer_uuid } : undefined,
      ellipsis: 'xl',
      maxLength: 11,
    },
    {
      key: 'marketplace-vendor-offerings',
      text: translate('Offerings'),
      to: 'marketplace-vendor-offerings',
      params: offering ? { uuid: offering.customer_uuid } : undefined,
      ellipsis: 'md',
    },
    {
      key: 'offering',
      text: offering?.name || '...',
      dropdown:
        provider && offering
          ? (close) => (
              <OfferingBreadcrumbPopover
                provider={provider}
                offering={offering}
                page={page}
                close={close}
              />
            )
          : undefined,
      truncate: true,
      active: true,
    },
  ];
};
