import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showPriceSelector } from '@waldur/invoices/details/utils';
import { ShoppingCartTimeSlots } from '@waldur/marketplace/cart/ShoppingCartTimeSlots';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import { TermsOfService } from '../orders/TermsOfService';
import { BillingPeriod } from '../types';

import './ShoppingCartItem.scss';
import { ShoppingCartItemUpdateLink } from './ShoppingCartItemUpdateLink';

interface ShoppingCartItemProps {
  item: OrderItemResponse;
  onRemove(): void;
  isRemovingItem: boolean;
  termsOfServiceIsVisible?: boolean;
  maxUnit: BillingPeriod;
}

const TosCell: FunctionComponent<ShoppingCartItemProps> = (props) => (
  <td className="text-center">
    {props.item.offering_shared &&
    props.item.offering_billable &&
    props.item.offering_terms_of_service ? (
      <TermsOfService
        name={props.item.offering_uuid}
        offering_terms_of_service={props.item.offering_terms_of_service}
      />
    ) : (
      <>&mdash;</>
    )}
  </td>
);

export const ShoppingCartItem: FunctionComponent<ShoppingCartItemProps> = (
  props,
) => {
  const showPrice = useSelector(showPriceSelector);
  return (
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
                {props.item.attributes.name ||
                  props.item.resource_name ||
                  props.item.offering_name}
              </ShoppingCartItemUpdateLink>
            </h5>
            <p>
              {props.item.attributes.description || (
                <FormattedHtml html={props.item.offering_description} />
              )}
            </p>
            <ShoppingCartTimeSlots
              schedules={props.item.attributes.schedules}
            />
          </div>
        </div>
      </td>
      {showPrice && (
        <>
          {props.maxUnit ? (
            <td className="text-center text-lg">
              {defaultCurrency(props.item.fixed_price || 0)}
            </td>
          ) : null}
          <td className="text-center text-lg">
            {defaultCurrency(props.item.activation_price || 0)}
          </td>
        </>
      )}
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
};
