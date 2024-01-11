import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { translate } from '@waldur/i18n';
import { OrderRequest } from '@waldur/marketplace/cart/types';
import { waitForConfirmation } from '@waldur/modal/actions';
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
  onBtnClick: () => {
    waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to submit the order?'),
    ).then(() => {
      dispatch(addItemRequest(ownProps.item));
    });
  },
});

const enhance = connect<{}, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps,
);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
