import { marketplaceServiceProvidersOfferingsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';

import { Offering, ServiceProvider } from '../types';

import { getStates } from './list/OfferingStateFilter';

interface OfferingBreadcrumbPopoverProps {
  provider: ServiceProvider;
  offering: Offering;
  page: 'details' | 'edit';
  close: () => void;
}

export const OfferingBreadcrumbPopover = ({
  provider,
  offering,
  page,
  close,
}: OfferingBreadcrumbPopoverProps) => (
  <BreadcrumbDropdown
    fetcher={marketplaceServiceProvidersOfferingsList}
    path={{ service_provider_uuid: provider.uuid }}
    queryKey="marketplaceServiceProvidersOfferingsList"
    queryField="name"
    params={{
      field: ['name', 'uuid', 'category_title', 'thumbnail'],
    }}
    filters={[
      {
        field: 'state',
        label: translate('Status'),
        options: getStates(),
      },
    ]}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to={
          page === 'edit'
            ? 'marketplace-offering-update'
            : 'marketplace-offering-details'
        }
        params={{ offering_uuid: row.uuid }}
        image={row.thumbnail}
        title={row.name}
        subtitle={row.category_title}
        isCurrent={row.uuid === offering?.uuid}
      />
    )}
    emptyMessage={translate('There are no offerings.')}
    close={close}
  />
);
