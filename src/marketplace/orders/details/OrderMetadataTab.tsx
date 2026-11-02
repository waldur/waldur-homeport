import {
  OrderDetails,
  PublicOfferingDetails as Offering,
} from 'waldur-js-client';

import { PropertyCard, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { getDetailsComponent } from '@/marketplace/common/registry';
import { OrderStateField } from '@/marketplace/orders/details/OrderStateField';
import { propVal } from '@/property/propertyFields';

export const OrderMetadataTab = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: Offering;
}) => {
  const DetailsComponent = getDetailsComponent(order.offering_type);
  return (
    <PropertyCard title={translate('Metadata')}>
      <PropertyList detailsMode>
        <PropertyItem
          label={translate('Backend ID')}
          value={order.backend_id}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          label={translate('Category')}
          value={order.category_title}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          label={translate('Components')}
          value={propVal.list(
            offering.components.map((component) => component.type),
          )}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          value={propVal.date(order.consumer_reviewed_at, {
            precision: 'datetime',
          })}
          label={translate('Consumer reviewed at')}
          hasCopy
          hideIfEmpty
        />

        {order.consumer_reviewed_by && (
          <PropertyItem
            label={translate('Consumer reviewed by')}
            value={propVal.user({
              full_name: order.consumer_reviewed_by_full_name,
              username: order.consumer_reviewed_by_username,
            })}
            hasCopy
          />
        )}

        {order.created_by_username && (
          <PropertyItem
            label={translate('Created by')}
            value={propVal.user({
              full_name: order.created_by_full_name,
              username: order.created_by_username,
            })}
            hasCopy
          />
        )}

        <PropertyItem
          label={translate('Creator civil number')}
          value={order.created_by_civil_number}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          value={propVal.date(order.completed_at, { precision: 'datetime' })}
          label={translate('Date completed')}
          hasCopy
        />

        <PropertyItem
          value={propVal.date(order.created, { precision: 'datetime' })}
          label={translate('Date created')}
          hasCopy
        />

        <PropertyItem
          value={propVal.date(order.modified, { precision: 'datetime' })}
          label={translate('Date modified')}
          hasCopy
        />

        <PropertyItem
          value={propVal.boolean(order.offering_billable)}
          label={translate('Offering billable?')}
        />

        <PropertyItem
          label={translate('Offering description')}
          value={propVal.richText(order.offering_description, {
            format: 'html',
          })}
        />

        <PropertyItem
          value={propVal.boolean(order.offering_shared)}
          label={translate('Offering shared?')}
        />

        <PropertyItem
          label={translate('Offering type')}
          value={order.offering_type}
          hasCopy
        />

        <PropertyItem
          label={translate('Offering UUID')}
          value={order.offering_uuid}
          hasCopy
        />

        <PropertyItem
          label={translate('Order ID')}
          value={order.slug}
          hasCopy
        />

        <PropertyItem
          label={translate('Organization')}
          value={order.customer_name}
          hasCopy
        />

        <PropertyItem
          label={translate('Project')}
          value={order.project_name}
          hasCopy
        />

        <PropertyItem
          label={translate('Provider name')}
          value={order.provider_name}
          hasCopy
        />

        <PropertyItem
          value={propVal.date(order.provider_reviewed_at, {
            precision: 'datetime',
          })}
          label={translate('Provider reviewed at')}
          hasCopy
          hideIfEmpty
        />

        {order.provider_reviewed_by && (
          <PropertyItem
            label={translate('Provider reviewed by')}
            value={propVal.user({
              full_name: order.provider_reviewed_by_full_name,
              username: order.provider_reviewed_by_username,
            })}
            hasCopy
          />
        )}

        <PropertyItem
          label={translate('Provider UUID')}
          value={order.provider_uuid}
          hasCopy
        />

        <PropertyItem
          label={translate('Resource backend UUID')}
          value={order.resource_uuid}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          label={translate('Resource name')}
          value={order.resource_name}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          label={translate('Resource type')}
          value={order.resource_type}
          hasCopy
          hideIfEmpty
        />

        <PropertyItem
          label={translate('Resource UUID')}
          value={order.marketplace_resource_uuid}
          hasCopy
        />

        <PropertyItem
          value={propVal.date(order.start_date, { precision: 'datetime' })}
          label={translate('Scheduled start date')}
          hasCopy
        />

        <PropertyItem
          label={translate('Status')}
          value={
            <OrderStateField
              order={order}
              shape="pill"
              tone="outline"
              hasBullet
            />
          }
        />

        {DetailsComponent && (
          <DetailsComponent order={order} offering={offering} />
        )}
      </PropertyList>
    </PropertyCard>
  );
};
