import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import { invoicesGrowthRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { GROWTH_FILTER_ID } from '@waldur/invoices/constants';
import { type RootState } from '@waldur/store/reducers';

import { formatGrowthChart } from './utils';

const growthFilterFormSelector = formValueSelector(GROWTH_FILTER_ID);

const getAccountingRunningFieldValue = (state: RootState) =>
  growthFilterFormSelector(state, 'accounting_is_running');

export const GrowthChart: FunctionComponent = () => {
  const accountRunningState = useSelector(getAccountingRunningFieldValue);
  const {
    isLoading: loading,
    error,
    data: option,
  } = useQuery({
    queryKey: ['growth-chart', accountRunningState?.value],

    queryFn: async ({ signal }) => {
      const response = await invoicesGrowthRetrieve({
        query: {
          accounting_is_running: accountRunningState?.value,
          accounting_mode: ENV.accountingMode,
        },
        signal,
      });
      return formatGrowthChart(response.data);
    },
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load growth chart.')}</>;
  }
  return (
    <Card.Body className="mt-3 p-m">
      <EChart options={option} height="400px" />
    </Card.Body>
  );
};
