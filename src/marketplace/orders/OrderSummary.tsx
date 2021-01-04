import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { PureShoppingCartSidebar } from '../cart/ShoppingCartSidebar';

type StateProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
  total: number;
  file?: string;
}

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  project: getProject(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  withTranslation,
);

export const OrderSummary = enhance(PureShoppingCartSidebar);
