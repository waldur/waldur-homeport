import { createSelector } from 'reselect';

import { isVisible } from '@waldur/store/config';
import { isStaff, isOwner } from '@waldur/workspace/selectors';

const serviceProviderIsVisible = state => isVisible(state, 'marketplace');

const ownerCanRegisterServiceProvider = (state: any): boolean =>
  state.config.plugins.WALDUR_MARKETPLACE.OWNER_CAN_REGISTER_SERVICE_PROVIDER;

export const renderServiceProvider = createSelector(
  serviceProviderIsVisible,
  ownerCanRegisterServiceProvider,
  isStaff,
  (visible, ownerCan, staff) => visible && (staff || ownerCan),
);

export const canRegisterServiceProviderForCustomer = createSelector(
  serviceProviderIsVisible,
  ownerCanRegisterServiceProvider,
  isStaff,
  isOwner,
  (visible, ownerCan, staff, owner) =>
    visible && (staff || (ownerCan && owner)),
);
