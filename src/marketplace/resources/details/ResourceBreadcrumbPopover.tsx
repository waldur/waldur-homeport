import { marketplaceResourcesList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const ResourceBreadcrumbPopover = ({ resource, close }) => (
  <BreadcrumbDropdown
    fetcher={marketplaceResourcesList}
    queryKey="marketplaceResourcesList"
    queryField="query"
    params={{
      state: ['Creating', 'OK', 'Erred', 'Updating', 'Terminating'],
      project_uuid: resource.project_uuid,
      category_uuid: resource.category_uuid,
      field: ['name', 'uuid', 'offering_thumbnail', 'state', 'created'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="marketplace-resource-details"
        params={{ resource_uuid: row.uuid }}
        image={row.offering_thumbnail}
        title={row.name}
        subtitle={formatDateTime(row.created)}
        isCurrent={row.uuid === resource.uuid}
      />
    )}
    placeholder={translate('Type in name of resource...')}
    emptyMessage={translate('There are no resources.')}
    close={close}
  />
);
