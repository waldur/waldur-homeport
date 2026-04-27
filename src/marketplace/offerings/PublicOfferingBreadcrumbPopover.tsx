import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const PublicOfferingBreadcrumbPopover = ({ offering, close }) => (
  <BreadcrumbDropdown
    fetcher={marketplacePublicOfferingsList}
    queryKey="marketplacePublicOfferingsList"
    queryField="keyword"
    params={{
      customer_uuid: offering.customer_uuid,
      state: ['Active', 'Paused'],
      field: ['name', 'uuid', 'thumbnail', 'category_title'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="public-offering.marketplace-public-offering"
        params={{ uuid: row.uuid }}
        image={row.thumbnail}
        title={row.name}
        subtitle={row.category_title}
        isCurrent={row.uuid === offering.uuid}
      />
    )}
    placeholder={translate('Type to search offerings...')}
    emptyMessage={translate('There are no offerings.')}
    close={close}
  />
);
