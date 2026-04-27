import { marketplaceOrdersList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';

export const OrderBreadcrumbPopover = ({ order, close }) => (
  <BreadcrumbDropdown
    fetcher={marketplaceOrdersList}
    queryKey="marketplaceOrdersList"
    queryField="query"
    params={{
      resource_uuid: order.marketplace_resource_uuid,
      o: ['-created'],
      field: ['uuid', 'type', 'attributes', 'created', 'state'],
    }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="marketplace-orders.details"
        params={{ order_uuid: row.uuid }}
        title={`${(row.attributes as Record<string, unknown>)?.name || translate('Order')} (${row.type})`}
        subtitle={formatDateTime(row.created)}
        isCurrent={row.uuid === order.uuid}
      />
    )}
    placeholder={translate('Type to search orders...')}
    emptyMessage={translate('There are no orders.')}
    close={close}
  />
);
