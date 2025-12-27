import { marketplaceResourcesList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { BreadcrumbDropdown } from '@waldur/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@waldur/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const ResourceBreadcrumbPopover = ({ order, close }) => (
  <BreadcrumbDropdown
    fetcher={marketplaceResourcesList}
    queryKey="marketplaceResourcesList"
    queryField="query"
    params={{
      state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
      project_uuid: order.project_uuid,
      category_uuid: order.category_uuid,
      field: ['name', 'uuid', 'offering_thumbnail', 'state', 'created'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="marketplace-resource-details"
        params={{ resource_uuid: row.uuid }}
        image={row.offering_thumbnail}
        title={row.name}
        subtitle={formatDateTime(row.created)}
        isCurrent={row.uuid === order.marketplace_resource_uuid}
      />
    )}
    placeholder={translate('Type to search resources...')}
    emptyMessage={translate('There are no resources.')}
    close={close}
  />
);
