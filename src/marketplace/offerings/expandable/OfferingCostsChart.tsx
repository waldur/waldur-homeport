import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { getOfferingCostChartData } from './api';
import { formatOfferingCostsChart } from './utils';

const getAccountingRunningFieldValue = (state, formId) =>
  formValueSelector(formId)(state, 'accounting_is_running');

interface OfferingCostChartProps {
  offeringUuid: string;
  uniqueFormId: string;
}

export const OfferingCostsChart: FunctionComponent<OfferingCostChartProps> = (
  props,
) => {
  const accountRunningState = useSelector((state: RootState) =>
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
