import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import { isStaff, isOwner } from '@waldur/workspace/selectors';

const ownerCanRegisterServiceProvider = (state: RootState): boolean =>
  state.config.plugins.WALDUR_MARKETPLACE.OWNER_CAN_REGISTER_SERVICE_PROVIDER;

export const renderServiceProvider = createSelector(
  ownerCanRegisterServiceProvider,
  isStaff,
  (ownerCan, staff) => staff || ownerCan,
);

export const canRegisterServiceProviderForCustomer = createSelector(
  ownerCanRegisterServiceProvider,
  isStaff,
  isOwner,
  (ownerCan, staff, owner) => staff || (ownerCan && owner),
);
