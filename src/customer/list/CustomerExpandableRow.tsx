import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AgreementInfo } from '@waldur/invoices/list/AgreementInfo';
import { InvoicesStatsList } from '@waldur/invoices/list/InvoicesStatsList';

import { getInvoice } from './api';

export const CustomerExpandableRow = React.memo((props: any) => {
  const accountingPeriod = useSelector((state) =>
    formValueSelector('customerListFilter')(state, 'accounting_period'),
  );
  const { loading, error, value } = useAsync(
    () => getInvoice(props.row, accountingPeriod.value),
    [props.row, accountingPeriod],
  );
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
