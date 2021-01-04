import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createSelector } from 'reselect';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { isStaff } from '@waldur/workspace/selectors';

import { orderCanBeApproved } from '../orders/store/selectors';
import { OrderItemResponse } from '../orders/types';

import { createOrderRequest } from './store/actions';
import {
  allOfferingsPrivate,
  allTermsOfServiceAgreed,
  getItems,
  isCreatingOrder,
} from './store/selectors';

interface ForwardButtonComponentProps extends TranslateProps {
  createOrder(): void;
  items: OrderItemResponse[];
  disabled: boolean;
  orderCanBeApproved: boolean;
}

interface PureForwardButton {
  title: string;
  action(state?: number): void;
  disabled: boolean;
  tooltip?: string;
}

export const PureForwardButton: FunctionComponent<PureForwardButton> = (
  props,
) => (
  <ActionButton
    title={props.title}
    icon="fa fa-arrow-right"
    className="btn btn-primary"
    action={props.action}
    disabled={props.disabled}
    tooltip={props.tooltip}
  />
);

const ForwardButtonComponent = (props: ForwardButtonComponentProps) =>
  props.items.length > 0 ? (
    props.orderCanBeApproved ? (
      <PureForwardButton
        title={props.translate('Purchase')}
        action={props.createOrder}
        disabled={props.disabled}
        tooltip={props.translate(
          'You have the right to purchase service without additional approval.',
        )}
      />
    ) : (
      <PureForwardButton
        title={props.translate('Request an approval')}
        action={props.createOrder}
        disabled={props.disabled}
      />
    )
  ) : null;

const orderCanBeAutoapproved = createSelector(
  isStaff,
  allOfferingsPrivate,
  orderCanBeApproved,
  (staff, isPrivate, permissions) => staff || isPrivate || permissions,
);

const mapStateToProps = (state: RootState) => ({
  items: getItems(state),
  disabled: isCreatingOrder(state) || !allTermsOfServiceAgreed(state),
  orderCanBeApproved: orderCanBeAutoapproved(state),
});

const enhance = compose(
  connect(mapStateToProps, { createOrder: createOrderRequest }),
  withTranslation,
);

export const ForwardButton = enhance(ForwardButtonComponent);
