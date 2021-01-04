import { RootState } from '@waldur/store/reducers';
import {
  isOwner,
  isAdmin,
  isManager,
  isStaff,
} from '@waldur/workspace/selectors';

const getOrders = (state: RootState) => state.marketplace.orders;

export const getStateChangeStatus = (state: RootState) =>
  getOrders(state).stateChangeStatus;

export const orderCanBeApproved = (state: RootState) => {
  if (isStaff(state)) {
    return true;
  }
  if (state.config.plugins.WALDUR_MARKETPLACE) {
    const marketplace = state.config.plugins.WALDUR_MARKETPLACE;
    if (marketplace.OWNER_CAN_APPROVE_ORDER && isOwner(state)) {
      return true;
    }
    if (marketplace.ADMIN_CAN_APPROVE_ORDER && isAdmin(state)) {
      return true;
    }
    if (marketplace.MANAGER_CAN_APPROVE_ORDER && isManager(state)) {
      return true;
    }
  }
  return false;
};
