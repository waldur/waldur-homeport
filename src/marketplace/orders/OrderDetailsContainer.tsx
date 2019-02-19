import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { OrderDetails } from './OrderDetails';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

const mapStateToProps = state => ({
  stateChangeStatus: selectors.getStateChangeStatus(state),
  orderCanBeApproved: selectors.orderCanBeApproved(state),
});

const mapDispatchToProps = {
  approveOrder: actions.approveOrder,
  rejectOrder: actions.rejectOrder,
};

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

export const OrderDetailsContainer = enhance(OrderDetails);

export default connectAngularComponent(OrderDetailsContainer);
