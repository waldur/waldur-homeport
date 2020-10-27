import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOfferingCostChartData } from '@waldur/marketplace/offerings/customers/api';
import { formatOfferingCostsChart } from '@waldur/marketplace/offerings/customers/utils';

const getAccountingRunningFieldValue = (state, formId) =>
  formValueSelector(formId)(state, 'accounting_is_running');

interface OfferingCostChartProps {
  offeringUuid: string;
  uniqueFormId: string;
}

export const OfferingCostsChart = (props: OfferingCostChartProps) => {
  const accountRunningState = useSelector((state) =>
    getAccountingRunningFieldValue(state, props.uniqueFormId),
  );
  const { loading, error, value: option } = useAsync(
    () =>
      getOfferingCostChartData(
        accountRunningState?.value,
        props.offeringUuid,
      ).then(formatOfferingCostsChart),
    [accountRunningState, props.offeringUuid],
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load offering cost chart.')}</>;
  }
  return (
    <div className="ibox-content m-t-md p-m">
      <EChart options={option} height="400px" />
    </div>
  );
};
