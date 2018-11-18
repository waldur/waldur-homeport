import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { OrderItemDetails } from '@waldur/marketplace/orders/OrderItemDetails';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Category } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

interface OrderItemDetailsContainerState {
  orderItem: OrderItemResponse;
  offering: Offering;
  category: Category;
  loading: boolean;
  loaded: boolean;
}

class OrderItemDetailsContainer extends React.Component<undefined, OrderItemDetailsContainerState> {
  state = {
    orderItem: null,
    offering: null,
    category: null,
    loading: true,
    loaded: false,
  };

  async loadData() {
    try {
      const orderItemUuid = $state.params.order_item_uuid;
      const orderItem = await api.getOrderItem(orderItemUuid);
      const offering = await api.getOffering(orderItem.offering_uuid);
      const category = await api.getCategory(offering.category_uuid);
      this.setState({
        orderItem,
        offering,
        category,
        loading: false,
        loaded: true,
      });
    } catch (error) {
      this.setState({
        loading: false,
        loaded: false,
      });
    }
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {translate('Unable to get order item.')}
        </h3>
      );
    }

    return (
      <OrderItemDetails
        orderItem={this.state.orderItem}
        offering={this.state.offering}
        category={this.state.category}
      />
    );
  }
}

export default connectAngularComponent(OrderItemDetailsContainer);
