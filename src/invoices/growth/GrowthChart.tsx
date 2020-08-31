import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getGrowthChartData } from '@waldur/invoices/api';
import { GROWTH_FILTER_ID } from '@waldur/invoices/constants';
import { formatGrowthChart } from '@waldur/invoices/growth/utils';

const growthFilterFormSelector = formValueSelector(GROWTH_FILTER_ID);

const getAccountingRunningFieldValue = (state) =>
  growthFilterFormSelector(state, 'accounting_is_running');

export const GrowthChart = () => {
  const accountRunningState = useSelector(getAccountingRunningFieldValue);
  const { loading, error, value: option } = useAsync(
    () =>
      getGrowthChartData(accountRunningState?.value).then(formatGrowthChart),
    [accountRunningState],
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load growth chart.')}</>;
  }
  return (
    <div className="ibox-content m-t-md p-m">
      <EChart options={option} height="400px" />
    </div>
  );
};
