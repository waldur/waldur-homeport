import * as React from 'react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { PaymentsList } from '@waldur/customer/payments/PaymentsList';
import { translate } from '@waldur/i18n';
import { getActivePaymentProfile } from '@waldur/invoices/details/utils';
import {
  getCustomer,
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
  isOwner as isOwnerSelector,
} from '@waldur/workspace/selectors';

import { CustomerAccordion } from '../details/CustomerAccordion';

export const PaymentsPanel = () => {
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
    return (
      <CustomerAccordion
        title={translate('Payments list')}
        subtitle={translate(
          'Payments connected with an active payment profile.',
        )}
      >
        {(isStaff || isSupport) && <PaymentsList />}
      </CustomerAccordion>
    );
  } else {
    return null;
  }
};
