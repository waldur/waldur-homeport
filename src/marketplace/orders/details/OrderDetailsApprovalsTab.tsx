import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { OrderStateCell } from '../list/OrderStateCell';

import { ExportOrderComponentsButton } from './ExportOrderComponentsButton';
import { OrderComponentsTable } from './OrderComponentsTable';
import { OrderSummaryMessage } from './OrderSummaryMessage';

export const OrderDetailsApprovalsTab = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
}) => {
  return (
    <FormTable.Card
      className="card-bordered"
      title={translate('Approvals')}
      actions={<ExportOrderComponentsButton />}
    >
      <FormTable>
        <FormTable.Item label={translate('Order slug')} value={order['slug']} />

        <FormTable.Item
          label={translate('Project')}
          value={order.project_name}
        />

        <FormTable.Item
          label={translate('Organization')}
          value={order.customer_name}
        />

        <FormTable.Item
          label={translate('Status')}
          value={<OrderStateCell row={order} />}
        />

        <FormTable.Item
          label={translate('Description')}
          value={<OrderSummaryMessage order={order} offering={offering} />}
          className="d-print-none"
        />

        <FormTable.Item
          label={translate('Created by')}
          value={order.created_by_full_name}
        />

        <FormTable.Item
          label={translate('Created at')}
          value={formatDateTime(order.created)}
        />

        {order.provider_reviewed_by_full_name ? (
          <FormTable.Item
            label={translate('Reviewed by provider')}
            value={order.provider_reviewed_by_full_name}
          />
        ) : null}
        {order.provider_reviewed_at ? (
          <FormTable.Item
            label={translate('Reviewed by provider at')}
            value={formatDateTime(order.provider_reviewed_at)}
          />
        ) : null}
        {order.consumer_reviewed_by_full_name ? (
          <FormTable.Item
            label={translate('Reviewed by consumer')}
            value={order.consumer_reviewed_by_full_name}
          />
        ) : null}
        {order.consumer_reviewed_at ? (
          <FormTable.Item
            label={translate('Reviewed by consumer at')}
            value={formatDateTime(order.consumer_reviewed_at)}
          />
        ) : null}

        <FormTable.Item
          label={translate('Start date')}
          value={formatDateTime(order.start_date)}
        />
      </FormTable>
      <OrderComponentsTable order={order} offering={offering} />
    </FormTable.Card>
  );
};
