import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { ShoppingCartSteps } from '@waldur/marketplace/cart/ShoppingCartSteps';
import { State } from '@waldur/marketplace/cart/types';
import { getOrderDetails } from '@waldur/marketplace/common/api';
import { OrderSummary } from '@waldur/marketplace/orders/OrderSummary';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShoppingCart } from '../cart/ShoppingCart';
import { matchState } from './utils';

interface OrderDetailsState {
  orderDetails: State;
  loading: boolean;
  loaded: boolean;
}

class OrderDetails extends React.Component<TranslateProps, OrderDetailsState> {
  constructor(props) {
    super(props);
    this.state = {
      orderDetails: {state: 'Approve', items: []},
      loading: true,
      loaded: false,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      const orderDetails = await getOrderDetails($state.params.order_uuid);
      this.setState({
        orderDetails: {
          state: matchState(orderDetails.state),
          items: orderDetails.items,
          total_cost: orderDetails.total_cost,
        },
        loading: false,
        loaded: true,
      });
    } catch {
      this.setState({
        orderDetails: {state: 'Approve', items: []},
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {this.props.translate('Unable to load order details.')}
        </h3>
      );
    }

    return (
      <div className="row">
        <div className="col-xl-9 col-lg-8">
          <ShoppingCartSteps state={this.state.orderDetails.state} />
          <ShoppingCart
            items={this.state.orderDetails.items}
            editable={false}
          />
        </div>
        <div className="col-xl-3 col-lg-4">
          <OrderSummary total={this.state.orderDetails.total_cost}/>
        </div>
      </div>
    );
  }
}

export default connectAngularComponent(withTranslation(OrderDetails));
