import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { ResourceDetailsLink } from '@waldur/marketplace/resources/ResourceDetailsLink';
import { ResourceReference } from '@waldur/marketplace/resources/types';

import './OrderItem.scss';
import { OrderItemDetailsLink } from './OrderItemDetailsLink';

interface OrderItemProps {
  project_uuid: string;
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
              order_item_uuid={props.item.uuid}
              project_uuid={props.project_uuid}
            >
              <OfferingLogo src={props.item.offering_thumbnail}/>
            </OrderItemDetailsLink>
          </Tooltip>
        </div>
        <div className="offering-info">
          <h5 className="offering-title">
            <OrderItemDetailsLink
              order_item_uuid={props.item.uuid}
              project_uuid={props.project_uuid}
            >
              {props.item.attributes.name || props.item.offering_name}
            </OrderItemDetailsLink>
          </h5>
          <p>{props.item.attributes.description || props.item.offering_description}</p>
          {props.item.resource_uuid && (
            <p>
              <ResourceDetailsLink item={props.item as ResourceReference}>
                {translate('Resource link')}
              </ResourceDetailsLink>
            </p>
          )}
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.cost || 0)}
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
