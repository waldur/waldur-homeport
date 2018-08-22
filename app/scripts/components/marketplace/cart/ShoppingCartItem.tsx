import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';

import './ShoppingCartItem.scss';
import { OrderItem } from './types';

interface ShoppingCartItemProps {
  item: OrderItem;
  editable: boolean;
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
          <p>
            <b>Details:</b> {props.item.offering_description}
          </p>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.cost)}
    </td>
    {props.editable && (
      <td className="text-center">
        <span className="btn-group">
          <a className="btn btn-outline btn-success">
            Edit
          </a>
        </span>
      </td>
    )}
  </tr>
);
