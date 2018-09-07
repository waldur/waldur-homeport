import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ShoppingCartItemDetails } from '@waldur/marketplace/cart/ShoppingCartItemDetails';

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
        <Link
          state="marketplace-offering"
          params={{offering_uuid: props.item.offering_uuid}}
          className="offering-thumb">
          <img src={props.item.offering_thumbnail}/>
        </Link>
        <div className="offering-info">
          <h4 className="offering-title">
            <Link
              state="marketplace-offering"
              params={{offering_uuid: props.item.offering_uuid}}>
              {props.item.offering_name}
            </Link>
          </h4>
          <ShoppingCartItemDetails item={props.item} translate={translate}/>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.cost)}
    </td>
    <td className="text-center">
      <span className="btn-group">
        {props.editable && (
          <a className="btn btn-outline btn-success m-r-xs">
            {translate('Edit')}
          </a>
        )}
        <a className="btn btn-outline btn-danger" onClick={props.onRemove}>
          {translate('Remove')}
        </a>
      </span>
    </td>
  </tr>
);
