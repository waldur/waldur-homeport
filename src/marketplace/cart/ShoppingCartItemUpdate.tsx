import { FunctionComponent, Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ShoppingCartItemUpdateExtraComponent } from '@waldur/marketplace/cart/ShoppingCartItemUpdateExtraComponent';
import { Plan, Offering } from '@waldur/marketplace/types';
import { setTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';

import * as api from '../common/api';
import '../details/OfferingDetails.scss';
import { OrderSummary } from '../details/OrderSummary';
import { OrderItemResponse } from '../orders/types';

import { ShoppingCartItemUpdateForm } from './ShoppingCartItemUpdateForm';
import { getItemSelectorFactory } from './store/selectors';

interface PureShoppingCartItemUpdateProps {
  offering: Offering;
  plan?: Plan;
  shoppingCartItem: OrderItemResponse;
  limits: string[];
}

const PureShoppingCartItemUpdate: FunctionComponent<PureShoppingCartItemUpdateProps> = (
  props,
) => (
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
          extraComponent={ShoppingCartItemUpdateExtraComponent}
        />
      </Col>
    </Row>
  </>
);

interface ShoppingCartItemUpdateProps {
  shoppingCartItem: OrderItemResponse;
  setTitle: typeof setTitle;
}

class ShoppingCartItemUpdateComponent extends Component<ShoppingCartItemUpdateProps> {
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
        (plugin) => plugin.offering_type === offering.type,
      ).available_limits;
      let plan = {};
      if (offering && this.props.shoppingCartItem.plan_uuid) {
        plan = offering.plans.find(
          (offeringPlan) =>
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
    this.props.setTitle(translate('Shopping cart item update'));
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

const mapStateToProps = (state: RootState) => ({
  shoppingCartItem: getItemSelectorFactory(
    router.globals.params.order_item_uuid,
  )(state),
});

export const ShoppingCartItemUpdate = connect(mapStateToProps, { setTitle })(
  ShoppingCartItemUpdateComponent,
);
