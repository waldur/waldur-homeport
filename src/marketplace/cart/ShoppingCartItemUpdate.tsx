import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import { connect } from 'react-redux';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { Plan, Offering } from '@waldur/marketplace/types';

import * as api from '../common/api';
import { OrderSummary } from '../details/OrderSummary';
import { OrderItemResponse } from '../orders/types';

import { ShoppingCartItemUpdateForm } from './ShoppingCartItemUpdateForm';
import { getItemSelectorFactory } from './store/selectors';

import '../details/OfferingDetails.scss';

interface PureShoppingCartItemUpdateProps {
  offering: Offering;
  plan?: Plan;
  shoppingCartItem: OrderItemResponse;
  limits: string[];
}

const PureShoppingCartItemUpdate = (props: PureShoppingCartItemUpdateProps) => (
  <>
    {props.offering.description && (
      <div className="bs-callout bs-callout-success">
        <FormattedHtml html={props.offering.description} />
      </div>
    )}
    <Row>
      <Col md={9}>
        <h3 className="header-bottom-border">
          {translate('Shopping cart item update')}
        </h3>
        <ShoppingCartItemUpdateForm
          initialAttributes={props.shoppingCartItem.attributes}
          initialLimits={props.shoppingCartItem.limits}
          offering={props.offering}
          limits={props.limits}
          plan={props.plan}
        />
      </Col>
      <Col md={3}>
        <h3 className="header-bottom-border">{translate('Order summary')}</h3>
        <OrderSummary
          offering={{ ...props.offering, uuid: props.shoppingCartItem.uuid }}
          updateMode={true}
        />
      </Col>
    </Row>
  </>
);

interface ShoppingCartItemUpdateProps {
  shoppingCartItem: OrderItemResponse;
}

class ShoppingCartItemUpdateComponent extends React.Component<
  ShoppingCartItemUpdateProps
> {
  state = {
    loading: false,
    loaded: false,
    plan: null,
    offering: null,
    limits: [],
  };

  async loadData() {
    try {
      this.setState({ loading: true });
      const offering = await api.getOffering(
        this.props.shoppingCartItem.offering_uuid,
      );
      const plugins = await api.getPlugins();
      const limits = plugins.find(
        plugin => plugin.offering_type === offering.type,
      ).available_limits;
      let plan = {};
      if (offering && this.props.shoppingCartItem.plan_uuid) {
        plan = offering.plans.find(
          offeringPlan =>
            offeringPlan.uuid === this.props.shoppingCartItem.plan_uuid,
        );
      }
      this.setState({ loading: false, loaded: true, plan, offering, limits });
    } catch (error) {
      this.setState({ loading: false, loaded: false });
    }
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    if (this.state.loading) {
      return <LoadingSpinner />;
    }
    if (!this.state.loaded) {
      return translate('Unable to load offering.');
    }
    return (
      <PureShoppingCartItemUpdate
        plan={this.state.plan}
        offering={this.state.offering}
        shoppingCartItem={this.props.shoppingCartItem}
        limits={this.state.limits}
      />
    );
  }
}

const mapStateToProps = state => ({
  shoppingCartItem: getItemSelectorFactory($state.params.order_item_uuid)(
    state,
  ),
});

export const ShoppingCartItemUpdate = connect(mapStateToProps)(
  ShoppingCartItemUpdateComponent,
);
