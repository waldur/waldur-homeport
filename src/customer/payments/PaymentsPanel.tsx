import { useEffect, useState, FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { PaymentsList } from '@waldur/customer/payments/PaymentsList';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import {
  getCustomer,
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
  isOwner as isOwnerSelector,
} from '@waldur/workspace/selectors';

export const PaymentsPanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const [activePaymentProfile, setActivePaymentProfile] = useState(
    getActivePaymentProfile(customer.payment_profiles),
  );
  const isStaff = useSelector(isStaffSelector);
  const isSupport = useSelector(isSupportSelector);
  const isOwner = useSelector(isOwnerSelector);

  useEffect(() => {
    setActivePaymentProfile(getActivePaymentProfile(customer.payment_profiles));
  }, [customer]);

  if (
    (isStaff || isSupport || (isOwner && customer.payment_profiles.length)) &&
    activePaymentProfile
  ) {
    return isStaff || isSupport ? <PaymentsList /> : null;
  } else {
    return null;
  }
};
