import * as classNames from 'classnames';
import * as React from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { defaultCurrency } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import { TermsOfService } from '../orders/TermsOfService';

import './ShoppingCartItem.scss';

import { ShoppingCartItemUpdateLink } from './ShoppingCartItemUpdateLink';

interface ShoppingCartItemProps {
  item: OrderItemResponse;
  onRemove(): void;
  isRemovingItem: boolean;
  termsOfServiceIsVisible?: boolean;
}

const TosCell = (props: ShoppingCartItemProps) => (
  <td className="text-center">
    {props.item.offering_shared &&
    props.item.offering_billable &&
    props.item.offering_terms_of_service ? (
      <TermsOfService
        name={props.item.offering_uuid}
        offering_terms_of_service={props.item.offering_terms_of_service}
      />
    ) : (
      <span>&mdash;</span>
    )}
  </td>
);

export const ShoppingCartItem = (props: ShoppingCartItemProps) => (
  <tr>
    <td>
      <div className="offering-item">
        <div className="offering-thumb">
          <Tooltip id="offering-tooltip" label={props.item.offering_name}>
            <ShoppingCartItemUpdateLink order_item_uuid={props.item.uuid}>
              <OfferingLogo src={props.item.offering_thumbnail} />
            </ShoppingCartItemUpdateLink>
          </Tooltip>
        </div>
        <div className="offering-info">
          <h5 className="offering-title">
            <ShoppingCartItemUpdateLink order_item_uuid={props.item.uuid}>
              {props.item.attributes.name || props.item.offering_name}
            </ShoppingCartItemUpdateLink>
          </h5>
          <p>
            {props.item.attributes.description || (
              <FormattedHtml html={props.item.offering_description} />
            )}
          </p>
        </div>
      </div>
    </td>
    <td className="text-center text-lg">
      {defaultCurrency(props.item.estimate || 0)}
    </td>
    <td className="text-center">
      <span className="btn-group">
        <a
          className={classNames('btn btn-outline btn-danger btn-sm', {
            disabled: props.isRemovingItem,
          })}
          onClick={props.onRemove}
        >
          <i className="fa fa-trash" /> {translate('Remove')}
        </a>
      </span>
    </td>
    {props.termsOfServiceIsVisible && <TosCell {...props} />}
  </tr>
);
