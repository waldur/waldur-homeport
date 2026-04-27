import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { PaymentProfile, paymentsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { getCustomer } from '@/workspace/selectors';

interface AgreementInfoProps {
  paymentProfiles?: PaymentProfile[];
}

export const AgreementInfo: FunctionComponent<AgreementInfoProps> = (props) => {
  const customer = useSelector(getCustomer);
  const activeFixedPricePaymentProfile = getActiveFixedPricePaymentProfile(
    customer ? customer.payment_profiles : props.paymentProfiles,
  );
  const { value: totalOfSumPaid } = useAsync(async () => {
    if (activeFixedPricePaymentProfile) {
      const response = await getAllPages((page) =>
        paymentsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            profile_uuid: activeFixedPricePaymentProfile.uuid,
          },
        }),
      );
      return response
        .map((payment) => parseInt(payment.sum))
        .reduce((a, b) => a + b);
    }
  }, [activeFixedPricePaymentProfile]);
  return (
    <>
      {activeFixedPricePaymentProfile ? (
        <div style={{ marginBottom: '20px' }}>
          {activeFixedPricePaymentProfile.attributes.agreement_number ? (
            <>
              {translate('Organization has signed a fixed price agreement')}{' '}
              {activeFixedPricePaymentProfile.attributes.agreement_number}.
              {activeFixedPricePaymentProfile.attributes.end_date ? (
                <>
                  {' '}
                  {translate('End date of the agreement is {date}.', {
                    date: formatDate(
                      activeFixedPricePaymentProfile.attributes.end_date,
                    ),
                  })}
                </>
              ) : null}
              {activeFixedPricePaymentProfile.attributes.contract_sum ? (
                <>
                  {' '}
                  {translate('Contract sum is {sum}.', {
                    sum: defaultCurrency(
                      activeFixedPricePaymentProfile.attributes.contract_sum,
                    ),
                  })}{' '}
                </>
              ) : null}
              <>
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
              </>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
};
