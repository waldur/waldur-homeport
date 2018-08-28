import { isOwner, isAdmin, isManager, isStaff } from '@waldur/workspace/selectors';

const getOrders = state => state.marketplace.orders;
export const getStateChangeStatus = state => getOrders(state).stateChangeStatus;

export const shouldRenderApproveButton = (env, state) => {
  if (isStaff(state)) {
    return true;
  }
  if (env.plugins.WALDUR_MARKETPLACE) {
    const marketplace = env.plugins.WALDUR_MARKETPLACE;
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
