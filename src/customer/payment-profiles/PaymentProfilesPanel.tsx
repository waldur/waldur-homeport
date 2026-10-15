import { FunctionComponent } from 'react';

import { useCustomer, useUser } from '@/workspace/hooks';
import { checkCanViewAccounting } from '@/workspace/selectors';

import { PaymentProfileDetails } from './PaymentProfileDetails';
import { PaymentProfileList } from './PaymentProfileList';

export const PaymentProfilesPanel: FunctionComponent = () => {
  const customer = useCustomer();
  const user = useUser();
  const isStaff = user?.is_staff;
  const isSupport = user?.is_support;
  const canViewAccounting = checkCanViewAccounting(customer, user);
  if (
    isStaff ||
    isSupport ||
    (canViewAccounting && customer.payment_profiles?.length)
  ) {
    return (
      <>
        {canViewAccounting && !isStaff && !isSupport && (
          <PaymentProfileDetails />
        )}
        {(isStaff || isSupport) && <PaymentProfileList />}
      </>
    );
  } else {
    return null;
  }
};
