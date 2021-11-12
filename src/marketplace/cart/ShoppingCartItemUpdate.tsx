import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ShoppingCartItemUpdateExtraComponent } from '@waldur/marketplace/cart/ShoppingCartItemUpdateExtraComponent';
import { Plan, Offering } from '@waldur/marketplace/types';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';

import * as api from '../common/api';
import '../details/OfferingDetails.scss';
import { OrderSummary } from '../details/OrderSummary';
import { OrderItemResponse } from '../orders/types';

import { ShoppingCartItemUpdateForm } from './ShoppingCartItemUpdateForm';

interface PureShoppingCartItemUpdateProps {
  offering: Offering;
  plan?: Plan;
  shoppingCartItem: OrderItemResponse;
  limits: string[];
}

const PureShoppingCartItemUpdate: FunctionComponent<PureShoppingCartItemUpdateProps> =
  (props) => (
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

async function loadData(itemId) {
  const cartItem = await api.getCartItem(itemId);
  const offering = await api.getOffering(cartItem.offering_uuid);
  const plugins = await api.getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  let plan = {} as Plan;
  if (offering && cartItem.plan_uuid) {
    plan = offering.plans.find(
      (offeringPlan) => offeringPlan.uuid === cartItem.plan_uuid,
    );
  }
  return { cartItem, offering, plan, limits };
}

export const ShoppingCartItemUpdate: FunctionComponent = () => {
  const state = useAsync(
    () => loadData(router.globals.params.order_item_uuid),
    [router.globals.params.order_item_uuid],
  );
  useTitle(translate('Shopping cart item update'));

  if (state.loading) {
    return <LoadingSpinner />;
  }
  if (state.error) {
    return <>{translate('Unable to load offering.')}</>;
  }
  return (
    <PureShoppingCartItemUpdate
      plan={state.value.plan}
      offering={state.value.offering}
      shoppingCartItem={state.value.cartItem}
      limits={state.value.limits}
    />
  );
};
