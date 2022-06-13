import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getGrowthChartData } from '@waldur/invoices/api';
import { GROWTH_FILTER_ID } from '@waldur/invoices/constants';
import { formatGrowthChart } from '@waldur/invoices/growth/utils';
import { RootState } from '@waldur/store/reducers';

const growthFilterFormSelector = formValueSelector(GROWTH_FILTER_ID);

const getAccountingRunningFieldValue = (state: RootState) =>
  growthFilterFormSelector(state, 'accounting_is_running');

export const GrowthChart: FunctionComponent = () => {
  const accountRunningState = useSelector(getAccountingRunningFieldValue);
  const {
    isLoading: loading,
    error,
    data: option,
  } = useQuery(
    `growth-chart-${Boolean(accountRunningState?.value)}`,
    async ({ signal }) =>
      await getGrowthChartData(accountRunningState?.value, { signal }).then(
        formatGrowthChart,
      ),
  );
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
