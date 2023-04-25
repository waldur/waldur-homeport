import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { CUSTOMERS_ORGANIZATION_GROUPS_FORM_ID } from '@waldur/customer/organization-groups/constants';
import { getEChartOptions } from '@waldur/customer/organization-groups/utils';
import { translate } from '@waldur/i18n';
import {
  getAllOrganizationGroups,
  getCustomersOrganizationGroupUuids,
} from '@waldur/marketplace/common/api';
import { RootState } from '@waldur/store/reducers';

const growthFilterFormSelector = formValueSelector(
  CUSTOMERS_ORGANIZATION_GROUPS_FORM_ID,
);

const getAccountingRunningFieldValue = (state: RootState) =>
  growthFilterFormSelector(state, 'accounting_is_running');

const loadData = (accounting_is_running: boolean, options?) =>
  Promise.all([
    getAllOrganizationGroups(options),
    getCustomersOrganizationGroupUuids(accounting_is_running, options),
  ]).then(([organizationGroups, customers]) => ({
    organizationGroups,
    customers,
  }));

export const CustomersOrganizationGroupsChart: FunctionComponent = () => {
  const accountRunningState = useSelector(getAccountingRunningFieldValue);
  const {
    isLoading: loading,
    error,
    data: option,
  } = useQuery(
    ['customer-organization-groups-chart', accountRunningState?.value],
    async ({ signal }) =>
      await loadData(accountRunningState?.value, { signal }).then(
        getEChartOptions,
      ),
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <Panel title={translate('Organizations by organization groups')}>
      <EChart options={option} height="550px" />
    </Panel>
  );
};
