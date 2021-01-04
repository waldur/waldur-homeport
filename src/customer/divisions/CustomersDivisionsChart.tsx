import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { CUSTOMERS_DIVISIONS_FORM_ID } from '@waldur/customer/divisions/constants';
import { getEChartOptions } from '@waldur/customer/divisions/utils';
import { translate } from '@waldur/i18n';
import {
  getAllOrganizationDivisions,
  getCustomersDivisionUuids,
} from '@waldur/marketplace/common/api';
import { RootState } from '@waldur/store/reducers';

const growthFilterFormSelector = formValueSelector(CUSTOMERS_DIVISIONS_FORM_ID);

const getAccountingRunningFieldValue = (state: RootState) =>
  growthFilterFormSelector(state, 'accounting_is_running');

const loadData = (accounting_is_running: boolean) =>
  Promise.all([
    getAllOrganizationDivisions(),
    getCustomersDivisionUuids(accounting_is_running),
  ]).then(([divisions, customers]) => ({
    divisions,
    customers,
  }));

export const CustomersDivisionsChart: FunctionComponent = () => {
  const accountRunningState = useSelector(getAccountingRunningFieldValue);
  const { loading, error, value: option } = useAsync(
    () => loadData(accountRunningState?.value).then(getEChartOptions),
    [accountRunningState],
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <Panel title={translate('Organizations by divisions')}>
      <EChart options={option} height="550px" />
    </Panel>
  );
};
