import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';
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

const growthFilterFormSelector = formValueSelector(CUSTOMERS_DIVISIONS_FORM_ID);

const getAccountingRunningFieldValue = (state) =>
  growthFilterFormSelector(state, 'accounting_is_running');

const loadData = (accounting_is_running: boolean) =>
  Promise.all([
    getAllOrganizationDivisions(),
    getCustomersDivisionUuids(accounting_is_running),
  ]).then(([divisions, customers]) => ({
    divisions,
    customers,
  }));

export const CustomersDivisionsChart = () => {
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
