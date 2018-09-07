import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { OrderItemLink } from './OrderItemLink';
import './ShoppingCartItem.scss';
import { OrderItemResponse } from './types';

interface ShoppingCartItemProps {
  item: OrderItemResponse;
  editable: boolean;
  onRemove(): void;
}

export const ShoppingCartItem = (props: ShoppingCartItemProps) => (
  <tr>
    <td>
      <div className="offering-item">
        <Tooltip id="offering-tooltip" label={props.item.offering_name}>
          <Link
            state="marketplace-offering"
            params={{offering_uuid: props.item.offering_uuid}}
            className="offering-thumb">
            <img src={props.item.offering_thumbnail}/>
          </Link>
        </Tooltip>
        <div className="offering-info">
          <h4 className="offering-title">
            <Link
              state="marketplace-offering"
              params={{offering_uuid: props.item.offering_uuid}}>
              {props.item.attributes.name}
            </Link>
          </h4>
          <p>
            {props.item.attributes.description || props.item.offering_description}
            <br/>
            {props.item.resource_uuid && <OrderItemLink item={props.item} translate={translate}/>}
          </p>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.cost || 0)}
    </td>
    {!props.editable && (
      <td className="text-center">
        {props.item.state}
      </td>
    )}
    {props.editable && (
      <td className="text-center">
        <span className="btn-group">
          <a className="btn btn-outline btn-success m-r-xs">
            {translate('Edit')}
          </a>
          <a className="btn btn-outline btn-danger" onClick={props.onRemove}>
            {translate('Remove')}
          </a>
        </span>
      </td>
    )}
  </tr>
);
