import { useEffect, useState, FunctionComponent } from 'react';
import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@/core/Link';
import { PaymentsList } from '@/customer/payments/PaymentsList';
import { formatJsxTemplate, translate } from '@/i18n';
import { getActivePaymentProfile } from '@/invoices/details/utils';
import { useCustomer } from '@/workspace/hooks';
import {
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
  isOwner as isOwnerSelector,
} from '@/workspace/selectors';

export const PaymentsPanel: FunctionComponent = () => {
  const customer = useCustomer();
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
    (isStaff || isSupport || (isOwner && customer.payment_profiles?.length)) &&
    activePaymentProfile
  ) {
    return isStaff || isSupport ? <PaymentsList /> : null;
  } else if (!activePaymentProfile) {
    return (
      <Alert variant="light">
        {translate(
          'You do not have an active payment profile, visit {link} to create a payment profile.',
          {
            link: (
              <Link
                state="organization-payment-profiles"
                label={translate('Payment profiles')}
              />
            ),
          },
          formatJsxTemplate,
        )}
      </Alert>
    );
  } else {
    return null;
  }
};
