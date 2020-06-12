import * as React from 'react';
import { useSelector } from 'react-redux';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';
import { PaymentProfile } from '@waldur/workspace/types';

interface AgreementInfoProps {
  paymentProfiles?: PaymentProfile[];
}

export const AgreementInfo = (props: AgreementInfoProps) => {
  const customer = useSelector(getCustomer);
  const activeFixedPricePaymentProfile = getActiveFixedPricePaymentProfile(
    customer ? customer.payment_profiles : props.paymentProfiles,
  );
  return (
    <>
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
                  .
                </span>
              ) : null}
              {activeFixedPricePaymentProfile.attributes.contract_sum ? (
                <span>
                  {' '}
                  {translate('Contract sum is')}{' '}
                  {activeFixedPricePaymentProfile.attributes.contract_sum}.
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
