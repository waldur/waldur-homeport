import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import {
  getCustomer,
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
  isOwner as isOwnerSelector,
} from '@waldur/workspace/selectors';

import { PaymentProfileDetails } from './PaymentProfileDetails';
import { PaymentProfileList } from './PaymentProfileList';

export const PaymentProfilesPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const isStaff = useSelector(isStaffSelector);
  const isSupport = useSelector(isSupportSelector);
  const isOwner = useSelector(isOwnerSelector);
  if (isStaff || isSupport || (isOwner && customer.payment_profiles.length)) {
    return (
      <>
        {isOwner && !isStaff && !isSupport && <PaymentProfileDetails />}
        {(isStaff || isSupport) && <PaymentProfileList />}
      </>
    );
  } else {
    return null;
  }
};
