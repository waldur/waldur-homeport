import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { PureShoppingCartSidebar } from '../cart/ShoppingCartSidebar';

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps),
);

export const OrderSummary = enhance(PureShoppingCartSidebar);
