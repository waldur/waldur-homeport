import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';
import {
  marketplacePublicOfferingsRetrieve,
  OrderDetails,
} from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { OrderNameField } from '@/marketplace/orders/list/OrderNameField';
import { OrderStateCell } from '@/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@/marketplace/orders/list/ResourceNameField';
import {
  OrderAwardLimits,
  OrderAwardSource,
} from '@/marketplace/orders/OrderAwardContext';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const OrdersListExpandableRow: FunctionComponent<{
  row: OrderDetails;
}> = ({ row: order }) => {
  // Named and in units as the offering lists its components, not by type.
  const { data: awardComponents } = useQuery({
    queryKey: ['OfferingComponents', order.offering_uuid],
    queryFn: () =>
      marketplacePublicOfferingsRetrieve({
        path: { uuid: order.offering_uuid },
        query: { field: ['components'] },
      }).then((response) => response.data.components),
    enabled: Boolean(order.award),
    staleTime: 5 * 60 * 1000,
  });
  const { state } = useCurrentStateAndParams();
  // From a provider's Orders, the proposal opens on that provider's part.
  const providerUuid = state.name?.startsWith('marketplace-provider')
    ? order.provider_uuid
    : undefined;
  return (
    <ExpandableContainer asTable>
      <PropertyItem
        label={translate('Project description')}
        value={order.project_description}
      />

      <PropertyItem
        label={translate('Offering')}
        value={<OrderNameField row={order} />}
      />

      <PropertyItem
        label={translate('Resource')}
        value={<ResourceNameField row={order} />}
      />

      <PropertyItem
        label={translate('Type')}
        value={<OrderTypeCell row={order} />}
      />
      <PropertyItem
        label={translate('State')}
        value={<OrderStateCell row={order} />}
      />
      <PropertyItem
        label={translate('Plan')}
        value={order.plan_name}
        hideIfEmpty={false}
      />

      {order.award ? (
        <>
          <PropertyItem
            label={translate('Award')}
            value={
              <OrderAwardSource
                award={order.award}
                providerUuid={providerUuid}
              />
            }
          />
          <PropertyItem
            label={translate('Awarded limits')}
            value={
              <OrderAwardLimits
                award={order.award}
                components={awardComponents}
              />
            }
          />
        </>
      ) : null}

      {order.attachment ? (
        <PropertyItem
          label={translate('Purchase order')}
          value={propVal.file(order.attachment, {
            fileName: translate('PDF file'),
          })}
        />
      ) : null}

      {order.request_comment ? (
        <PropertyItem
          label={translate('PO reference')}
          value={order.request_comment}
        />
      ) : null}

      {order.provider_message ? (
        <PropertyItem
          label={translate('Provider message')}
          value={propVal.richText(order.provider_message, { format: 'html' })}
        />
      ) : null}

      {order.consumer_message ? (
        <PropertyItem
          label={translate('Customer response')}
          value={propVal.richText(order.consumer_message, { format: 'html' })}
        />
      ) : null}

      {order.consumer_message_attachment ? (
        <PropertyItem
          label={translate('Customer attachment')}
          value={propVal.file(order.consumer_message_attachment, {
            fileName: translate('PDF file'),
          })}
        />
      ) : null}
    </ExpandableContainer>
  );
};
