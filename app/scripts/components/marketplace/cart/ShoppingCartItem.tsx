import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLink } from '@waldur/marketplace/links/OfferingLink';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import './ShoppingCartItem.scss';

interface ShoppingCartItemProps {
  item: OrderItemResponse;
  editable: boolean;
  onRemove(): void;
}

export const ShoppingCartItem = (props: ShoppingCartItemProps) => (
  <tr>
    <td>
      <div className="offering-item">
        <div className="offering-thumb">
          <Tooltip id="offering-tooltip" label={props.item.offering_name}>
            <OfferingLink offering_uuid={props.item.offering_uuid}>
              <img src={props.item.offering_thumbnail}/>
            </OfferingLink>
          </Tooltip>
        </div>
        <div className="offering-info">
          <h5 className="offering-title">
            <OfferingLink offering_uuid={props.item.offering_uuid}>
              {props.item.attributes.name}
            </OfferingLink>
          </h5>
          <p>{props.item.attributes.description || props.item.offering_description}</p>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.estimate)}
    </td>
    {!props.editable && (
      <td className="text-center">
        {props.item.state}
      </td>
    )}
    {props.editable && (
      <td className="text-center">
        <span className="btn-group">
          <a className="btn btn-outline btn-danger btn-sm" onClick={props.onRemove}>
            <i className="fa fa-trash"/>
            {' '}
            {translate('Remove')}
          </a>
        </span>
      </td>
    )}
  </tr>
);
