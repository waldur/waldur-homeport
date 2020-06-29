import * as React from 'react';
import { useSelector } from 'react-redux';

import { PaymentsList } from '@waldur/customer/payments/PaymentsList';
import { translate } from '@waldur/i18n';
import {
  getCustomer,
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
  isOwner as isOwnerSelector,
} from '@waldur/workspace/selectors';

import { CustomerAccordion } from '../details/CustomerAccordion';

export const PaymentsPanel = () => {
  const customer = useSelector(getCustomer);
  const isStaff = useSelector(isStaffSelector);
  const isSupport = useSelector(isSupportSelector);
  const isOwner = useSelector(isOwnerSelector);
  if (isStaff || isSupport || (isOwner && customer.payment_profiles.length)) {
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
