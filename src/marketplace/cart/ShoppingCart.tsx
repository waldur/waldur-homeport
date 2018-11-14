import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';

import './ShoppingCart.scss';
import { ShoppingCartItem } from './ShoppingCartItem';
import * as actions from './store/actions';
import { getMaxUnit, getItems } from './store/selectors';

interface ShoppingCartProps {
  items: OrderItemResponse[];
  maxUnit: 'month' | 'day';
  removeItem(uuid: string): void;
}

const PureShoppingCart = (props: ShoppingCartProps) => props.items.length > 0 ? (
  <div className="table-responsive shopping-cart">
    <table className="table">
      <thead>
        <tr>
          <th>{translate('Item')}</th>
          <th className="text-center">
            <BillingPeriod unit={props.maxUnit}/>
          </th>
          <th className="text-center">{translate('Actions')}</th>
        </tr>
      </thead>
      <tbody>
        {props.items.map((item, index) => (
          <ShoppingCartItem
            key={index}
            item={item}
            onRemove={() => props.removeItem(item.uuid)}
          />
        ))}
      </tbody>
    </table>
  </div>
) : (
  <p className="text-center">
    {translate('Shopping cart is empty. You should add items to cart first.')}
  </p>
);

const mapStateToProps = state => ({
  items: getItems(state),
  maxUnit: getMaxUnit(state),
});

const mapDispatchToProps = {
  removeItem: actions.removeItemRequest,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ShoppingCart = connector(PureShoppingCart);
