import * as React from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const AgreementInfo = () => {
  const customer = useSelector(getCustomer);
  const activeFixedPricePaymentProfile = customer.payment_profiles.find(
    profile => profile.is_active && profile.payment_type === 'fixed_price',
  );
  return (
    <React.Fragment>
      {activeFixedPricePaymentProfile ? (
        <div style={{ marginBottom: '20px' }}>
          {activeFixedPricePaymentProfile.attributes.agreement_number ? (
            <span>
              {translate('Organization has signed a fixed price agreement')}{' '}
              {activeFixedPricePaymentProfile.attributes.agreement_number}.
              {activeFixedPricePaymentProfile.attributes.end_date ? (
                <span>
                  {' '}
                  {translate('End date of the agreement is')}{' '}
                  {formatDate(
                    activeFixedPricePaymentProfile.attributes.end_date,
                  )}
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      ) : null}
    </React.Fragment>
  );
};
