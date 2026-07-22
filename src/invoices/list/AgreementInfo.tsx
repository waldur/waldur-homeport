import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { PaymentProfile, paymentsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getActiveFixedPricePaymentProfile } from '@/invoices/details/utils';
import { useCustomer } from '@/workspace/hooks';

interface AgreementInfoProps {
  paymentProfiles?: PaymentProfile[];
}

export const AgreementInfo: FunctionComponent<AgreementInfoProps> = (props) => {
  const customer = useCustomer();
  const activeFixedPricePaymentProfile = getActiveFixedPricePaymentProfile(
    customer ? customer.payment_profiles : props.paymentProfiles,
  );
  const { data: totalOfSumPaid } = useQuery({
    queryKey: ['AgreementInfo', activeFixedPricePaymentProfile?.uuid],
    // React Query forbids queryFn returning undefined; without a profile
    // there is nothing to fetch at all.
    enabled: Boolean(activeFixedPricePaymentProfile),
    queryFn: async () => {
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
        .reduce((a, b) => a + b, 0);
    },
  });
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
                    Number(
                      activeFixedPricePaymentProfile.attributes.contract_sum,
                    ) !== totalOfSumPaid
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
