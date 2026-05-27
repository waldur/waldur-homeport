import { FunctionComponent } from 'react';

import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwner } from '@/workspace/selectors';

import { PaymentProfileDetails } from './PaymentProfileDetails';
import { PaymentProfileList } from './PaymentProfileList';

export const PaymentProfilesPanel: FunctionComponent = () => {
  const customer = useCustomer();
  const user = useUser();
  const isStaff = user?.is_staff;
  const isSupport = user?.is_support;
  const isOwner = checkIsOwner(customer, user);
  if (isStaff || isSupport || (isOwner && customer.payment_profiles?.length)) {
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
