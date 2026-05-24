import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { memo } from 'react';
import { useFormState } from 'react-final-form';
import { invoicesList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { AgreementInfo } from '@/invoices/list/AgreementInfo';
import { InvoicesStatsList } from '@/invoices/list/InvoicesStatsList';
import { FinancialReportsFilterFormData } from '@/table/generated/FinancialReportsFilter';

export const CustomerExpandableRow = memo((props: any) => {
  const { values } = useFormState<FinancialReportsFilterFormData>();
  const accountingPeriod = values?.accounting_period;
  const now = DateTime.now().startOf('month');
  const {
    isLoading: loading,
    error,
    data: value,
  } = useQuery({
    queryKey: ['CustomerExpandableRow', props.row, accountingPeriod],

    queryFn: () =>
      invoicesList({
        query: {
          customer_uuid: props.row.uuid,
          year: accountingPeriod ? accountingPeriod.value.year : now.year,
          month: accountingPeriod ? accountingPeriod.value.month : now.month,
        },
      }).then((response) => response.data[0]),
  });
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load organization resources.')}</>;
  } else {
    return (
      <>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '5px',
          }}
        >
          <AgreementInfo paymentProfiles={props.row.payment_profiles} />
        </div>
        {value ? (
          <InvoicesStatsList
            organization={props.row}
            invoiceUuid={value.uuid}
            providerUUID={props.providerUUID}
          />
        ) : (
          <p className="text-center">
            {translate('No invoice data available.')}
          </p>
        )}
      </>
    );
  }
});
