import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';

import { OrderDetails } from './OrderDetails';
import * as actions from './store/actions';
import * as selectors from './store/selectors';

const mapStateToProps = (state: RootState) => ({
  stateChangeStatus: selectors.getStateChangeStatus(state),
  orderCanBeApproved: selectors.orderCanBeApproved(state),
});

const mapDispatchToProps = {
  approveOrder: actions.approveOrder,
  rejectOrder: actions.rejectOrder,
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const OrderDetailsContainer = enhance(OrderDetails);
