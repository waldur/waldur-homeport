import {
  OrderDetails,
  PublicOfferingDetails as Offering,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { FieldWithCopy } from '@waldur/core/FieldWithCopy';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { getDetailsComponent } from '@waldur/marketplace/common/registry';
import { OrderStateField } from '@waldur/marketplace/orders/details/OrderStateField';

export const OrderMetadataTab = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: Offering;
}) => {
  const DetailsComponent = getDetailsComponent(order.offering_type);
  return (
    <FormTable.Card title={translate('Metadata')}>
      <FormTable detailsMode>
        {order.backend_id && (
          <FormTable.Item
            label={translate('Backend ID')}
            value={<FieldWithCopy value={order.backend_id} />}
          />
        )}

        {order.category_title && (
          <FormTable.Item
            label={translate('Category')}
            value={<FieldWithCopy value={order.category_title} />}
          />
        )}

        {offering.components.length > 0 && (
          <FormTable.Item
            label={translate('Components')}
            value={
              <FieldWithCopy
                value={offering.components
                  .map((component) => component.type)
                  .join(', ')}
              />
            }
          />
        )}

        {order.consumer_reviewed_at && (
          <FormTable.Item
            label={translate('Consumer reviewed at')}
            value={
              <FieldWithCopy
                value={formatDateTime(order.consumer_reviewed_at)}
              />
            }
          />
        )}

        {order.consumer_reviewed_by && (
          <FormTable.Item
            label={translate('Consumer reviewed by')}
            value={
              <FieldWithCopy
                value={
                  order.consumer_reviewed_by_full_name
                    ? `${order.consumer_reviewed_by_full_name} (${order.consumer_reviewed_by_username})`
                    : order.consumer_reviewed_by_username
                }
              />
            }
          />
        )}

        {order.created_by_username && (
          <FormTable.Item
            label={translate('Created by')}
            value={
              <FieldWithCopy
                value={
                  order.created_by_full_name
                    ? `${order.created_by_full_name} (${order.created_by_username})`
                    : order.created_by_username
                }
              />
            }
          />
        )}

        {order.created_by_civil_number && (
          <FormTable.Item
            label={translate('Creator civil number')}
            value={<FieldWithCopy value={order.created_by_civil_number} />}
          />
        )}

        <FormTable.Item
          label={translate('Date completed')}
          value={
            <FieldWithCopy
              value={
                order.completed_at ? formatDateTime(order.completed_at) : '-'
              }
            />
          }
        />

        <FormTable.Item
          label={translate('Date created')}
          value={<FieldWithCopy value={formatDateTime(order.created)} />}
        />

        <FormTable.Item
          label={translate('Date modified')}
          value={
            <FieldWithCopy
              value={order.modified ? formatDateTime(order.modified) : '-'}
            />
          }
        />

        <FormTable.Item
          label={translate('Offering billable?')}
          value={order.offering_billable ? 'Yes' : 'No'}
        />

        <FormTable.Item
          label={translate('Offering description')}
          value={<FormattedHtml html={order.offering_description} />}
        />

        <FormTable.Item
          label={translate('Offering shared?')}
          value={order.offering_shared ? 'Yes' : 'No'}
        />

        <FormTable.Item
          label={translate('Offering type')}
          value={<FieldWithCopy value={order.offering_type} />}
        />

        <FormTable.Item
          label={translate('Offering UUID')}
          value={<FieldWithCopy value={order.offering_uuid} />}
        />

        <FormTable.Item
          label={translate('Order ID')}
          value={<FieldWithCopy value={order.slug} />}
        />

        <FormTable.Item
          label={translate('Organization')}
          value={<FieldWithCopy value={order.customer_name} />}
        />

        <FormTable.Item
          label={translate('Project')}
          value={<FieldWithCopy value={order.project_name} />}
        />

        <FormTable.Item
          label={translate('Provider name')}
          value={<FieldWithCopy value={order.provider_name} />}
        />

        {order.provider_reviewed_at && (
          <FormTable.Item
            label={translate('Provider reviewed at')}
            value={
              <FieldWithCopy
                value={formatDateTime(order.provider_reviewed_at)}
              />
            }
          />
        )}

        {order.provider_reviewed_by && (
          <FormTable.Item
            label={translate('Provider reviewed by')}
            value={
              <FieldWithCopy
                value={
                  order.provider_reviewed_by_full_name
                    ? `${order.provider_reviewed_by_full_name} (${order.provider_reviewed_by_username})`
                    : order.provider_reviewed_by_username
                }
              />
            }
          />
        )}

        <FormTable.Item
          label={translate('Provider UUID')}
          value={<FieldWithCopy value={order.provider_uuid} />}
        />

        {order.resource_uuid && (
          <FormTable.Item
            label={translate('Resource backend UUID')}
            value={<FieldWithCopy value={order.resource_uuid} />}
          />
        )}

        {order.resource_name && (
          <FormTable.Item
            label={translate('Resource name')}
            value={<FieldWithCopy value={order.resource_name} />}
          />
        )}

        {order.resource_type && (
          <FormTable.Item
            label={translate('Resource type')}
            value={<FieldWithCopy value={order.resource_type} />}
          />
        )}

        <FormTable.Item
          label={translate('Resource UUID')}
          value={<FieldWithCopy value={order.marketplace_resource_uuid} />}
        />

        <FormTable.Item
          label={translate('Scheduled start date')}
          value={
            <FieldWithCopy
              value={order.start_date ? formatDateTime(order.start_date) : '-'}
            />
          }
        />

        <FormTable.Item
          label={translate('Status')}
          value={<OrderStateField order={order} pill outline hasBullet />}
        />

        {DetailsComponent && (
          <DetailsComponent order={order} offering={offering} />
        )}
      </FormTable>
    </FormTable.Card>
  );
};
