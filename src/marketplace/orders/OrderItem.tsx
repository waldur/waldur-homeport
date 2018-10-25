import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OrderItemDetailsLink } from '@waldur/marketplace/orders/OrderItemDetailsLink';
import { OrderItemLink } from '@waldur/marketplace/orders/OrderItemLink';

import './OrderItem.scss';
import { OrderItemResponse } from './types';

interface OrderItemProps {
  item: OrderItemResponse;
  editable: boolean;
  onRemove?(): void;
}

export const OrderItem = (props: OrderItemProps) => (
  <tr>
    <td>
      <div className="offering-item">
        <div className="offering-thumb">
          <Tooltip id="offering-tooltip" label={props.item.offering_name}>
            <OrderItemDetailsLink
              order_item_uuid={props.item.uuid}>
              <OfferingLogo src={props.item.offering_thumbnail}/>
            </OrderItemDetailsLink>
          </Tooltip>
        </div>
        <div className="offering-info">
          <h5 className="offering-title">
            <OrderItemDetailsLink
              order_item_uuid={props.item.uuid}>
              {props.item.offering_name}
            </OrderItemDetailsLink>
          </h5>
          <p>{props.item.attributes.description || props.item.offering_description}</p>
          {props.item.resource_uuid && <p><OrderItemLink item={props.item}/>{translate('Resource link')}</p>}
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.cost)}
    </td>
    <td className="text-center">
      {props.item.state}
    </td>
    <td className="text-center">
      <span className="btn-group">
        {props.editable && (
          <a className="btn btn-outline btn-default btn-sm m-r-xs">
            {translate('Edit')}
          </a>
        )}
      </span>
    </td>
  </tr>
);
