import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useEffectOnce } from 'react-use';

import { formatDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { getTotalOfSumPaid } from '@waldur/customer/payments/api';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { getCustomer } from '@waldur/workspace/selectors';
import { PaymentProfile } from '@waldur/workspace/types';

interface AgreementInfoProps {
  paymentProfiles?: PaymentProfile[];
}

export const AgreementInfo: FunctionComponent<AgreementInfoProps> = (props) => {
  const customer = useSelector(getCustomer);
  const activeFixedPricePaymentProfile = getActiveFixedPricePaymentProfile(
    customer ? customer.payment_profiles : props.paymentProfiles,
  );
  const [totalOfSumPaid, setTotalOfSumPaid] = useState();
  useEffectOnce(() => {
    if (activeFixedPricePaymentProfile) {
      (async () => {
        setTotalOfSumPaid(
          await getTotalOfSumPaid(activeFixedPricePaymentProfile.uuid),
        );
      })();
    }
  });
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
                  {defaultCurrency(
                    activeFixedPricePaymentProfile.attributes.contract_sum,
                  )}
                  .
                </span>
              ) : null}
              <span>
                {' '}
                {translate('Total paid')}{' '}
                <span
                  style={
                    activeFixedPricePaymentProfile.attributes.contract_sum !==
                    totalOfSumPaid
                      ? {
                          color: 'red',
                          fontWeight: 'bold',
                        }
                      : null
                  }
                >
                  {defaultCurrency(totalOfSumPaid)}
                </span>
                .
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
