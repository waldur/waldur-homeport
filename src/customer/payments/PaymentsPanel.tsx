import { FunctionComponent, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';

import { Link } from '@/core/Link';
import { PaymentsList } from '@/customer/payments/PaymentsList';
import { formatJsxTemplate, translate } from '@/i18n';
import { getActivePaymentProfile } from '@/invoices/details/utils';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwner } from '@/workspace/selectors';

export const PaymentsPanel: FunctionComponent = () => {
  const customer = useCustomer();
  const [activePaymentProfile, setActivePaymentProfile] = useState(
    getActivePaymentProfile(customer.payment_profiles),
  );
  const user = useUser();
  const isStaff = user?.is_staff;
  const isSupport = user?.is_support;
  const isOwner = checkIsOwner(customer, user);

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
