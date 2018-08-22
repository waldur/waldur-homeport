import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Offering, Plan } from '@waldur/marketplace/types';
import { showSuccess } from '@waldur/store/coreSaga';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

interface OrderItem {
  offering: Offering;
  plan?: Plan;
  attributes?: {[key: string]: any};
}

interface ShoppingCartButtonContainerProps {
  item: OrderItem;
  flavor?: string;
  disabled?: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  inCart: hasItem(state, ownProps.offering),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => {
      dispatch(addItem(ownProps.item));
      dispatch(showSuccess(translate('Order item has been created.')));
    },
    removeItem: () => dispatch(removeItem(ownProps.item)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ShoppingCartButtonContainer: React.ComponentClass<ShoppingCartButtonContainerProps> =
  enhance(ShoppingCartButton);
