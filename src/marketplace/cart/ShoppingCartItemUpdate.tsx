import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Plan, Offering } from '@waldur/marketplace/types';
import { useTitle } from '@waldur/navigation/title';
import { MARKETPLACE_RANCHER } from '@waldur/rancher/cluster/create/constants';
import { router } from '@waldur/router';

import * as api from '../common/api';
import { getFormLimitParser, Limits } from '../common/registry';
import { DeployPage } from '../deploy/DeployPage';
import { OrderSummary } from '../details/OrderSummary';
import { OrderResponse } from '../orders/types';

import { ShoppingCartItemUpdateExtraComponent } from './ShoppingCartItemUpdateExtraComponent';
import { ShoppingCartItemUpdateForm } from './ShoppingCartItemUpdateForm';

import '../details/OfferingDetails.scss';

interface PureShoppingCartItemUpdateProps {
  offering: Offering;
  plan?: Plan;
  cartItem: OrderResponse;
  limits: string[];
  initialLimits: Limits;
}

const PureShoppingCartItemUpdate: FunctionComponent<PureShoppingCartItemUpdateProps> =
  (props) =>
    [OFFERING_TYPE_BOOKING, MARKETPLACE_RANCHER].includes(
      props.offering.type,
    ) ? (
      <DeployPage
        offering={props.offering}
        limits={props.limits}
        cartItem={props.cartItem}
        plan={props.plan}
        initialAttributes={props.cartItem.attributes}
        initialLimits={props.initialLimits}
        updateMode
      />
    ) : (
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
              initialAttributes={props.cartItem.attributes}
              initialLimits={props.initialLimits}
              offering={props.offering}
              limits={props.limits}
              plan={props.plan}
            />
          </Col>
          <Col md={3}>
            <h3 className="header-bottom-border">
              {translate('Order summary')}
            </h3>
            <OrderSummary
              offering={{ ...props.offering, uuid: props.cartItem.uuid }}
              updateMode={true}
              extraComponent={ShoppingCartItemUpdateExtraComponent}
            />
          </Col>
        </Row>
      </>
    );

async function loadData(itemId) {
  const cartItem = await api.getCartItem(itemId);
  const offering = await api.getPublicOffering(cartItem.offering_uuid);
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
  const limitParser = getFormLimitParser(offering.type);
  const initialLimits = limitParser(cartItem.limits);
  return { cartItem, offering, plan, limits, initialLimits };
}

export const ShoppingCartItemUpdate: FunctionComponent = () => {
  const state = useAsync(
    () => loadData(router.globals.params.order_uuid),
    [router.globals.params.order_uuid],
  );
  useTitle(translate('Shopping cart item update'));

  if (state.loading) {
    return <LoadingSpinner />;
  }
  if (state.error) {
    return <>{translate('Unable to load offering.')}</>;
  }
  return <PureShoppingCartItemUpdate {...state.value} />;
};
