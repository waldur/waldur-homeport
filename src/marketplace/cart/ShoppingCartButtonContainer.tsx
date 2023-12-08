import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { OrderRequest } from '@waldur/marketplace/cart/types';
import { RootState } from '@waldur/store/reducers';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItemRequest } from './store/actions';
import { isAddingItem } from './store/selectors';

interface OwnProps {
  item: OrderRequest;
  flavor?: string;
  disabled?: boolean;
}

interface DispatchProps {
  onBtnClick(): void;
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  disabled: ownProps.disabled || isAddingItem(state),
  isAddingItem: isAddingItem(state),
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) => ({
  onBtnClick: () => dispatch(addItemRequest(ownProps.item)),
});

const enhance = connect<{}, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
