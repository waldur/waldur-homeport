import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { isUpdatingItem } from '@waldur/marketplace/cart/store/selectors';
import { OuterState } from '@waldur/marketplace/cart/types';

import { OrderItemResponse } from '../orders/types';
import { ShoppingCartUpdateButton } from './ShoppingCartUpdateButton';
import { updateItemRequest } from './store/actions';

interface OwnProps {
  item: OrderItemResponse;
  flavor?: string;
  disabled?: boolean;
}

interface DispatchProps {
  updateItem(): void;
}

const mapStateToProps = (state: OuterState, ownProps: OwnProps) => ({
  disabled: ownProps.disabled || isUpdatingItem(state),
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
  updateItem: () => dispatch(updateItemRequest(ownProps.item)),
});

const enhance = connect<{}, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps);

export const ShoppingCartUpdateButtonContainer = enhance(ShoppingCartUpdateButton);
