import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { PureShoppingCartSidebar } from '../cart/ShoppingCartSidebar';

interface StateProps {
  customer: Customer;
  project: Project;
}

const mapStateToProps = state => ({
  customer: getCustomer(state),
  project: getProject(state),
});

const enhance = compose(
  connect<StateProps, {}, {total: number}>(mapStateToProps),
  withTranslation,
);

export const OrderSummary = enhance(PureShoppingCartSidebar);
