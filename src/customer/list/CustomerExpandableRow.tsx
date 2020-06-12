import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { AgreementInfo } from '@waldur/invoices/list/AgreementInfo';
import { ResourceExpandableRow } from '@waldur/resource/ResourceExpandableRow';

import { loadCustomerResources } from './api';

export const CustomerExpandableRow = props => {
  const { loading, error, value } = useAsync(
    () => loadCustomerResources(props.row),
    [props.row],
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
        <ResourceExpandableRow rows={value} />
      </>
    );
  }
};
