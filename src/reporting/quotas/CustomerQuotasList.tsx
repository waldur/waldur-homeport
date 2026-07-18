import { useMemo } from 'react';
import { customerQuotasList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  CustomerQuotasFilter,
  CustomerQuotasFilterInitialValues,
  selectCustomerQuotasFilter,
  CustomerQuotasFilterFormId,
} from '@/table/generated/CustomerQuotasFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { getQuotas } from './constants';
import { QuotasAnalytics } from './QuotasAnalytics';
import { CustomerQuota } from './types';

export const CustomerQuotasList = () => {
  const values = useFilterValues('CustomerQuotasList');
  const filter = useMemo(() => selectCustomerQuotasFilter(values), [values]);
  const tableProps = useTable({
    table: 'CustomerQuotasList',
    syncFiltersToURL: true,
    fetchData: createFetcher(customerQuotasList),
    filter,
    // The /customer-quotas/ endpoint requires a quota_name; seed the default so
    // the first request is valid (otherwise it 400s and the table never loads).
    initialFilters: CustomerQuotasFilterInitialValues,
  });

  const activeQuota = getQuotas(true).find((q) => q.key === filter?.quota_name);

  return (
    <>
      <ReportingTitle reportKey="quotas" />
      <Table<CustomerQuota>
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => <>{row.customer_name}</>,
            copyField: (row) => row.customer_name,
            orderField: 'name',
          },
          {
            title: translate('Abbreviation'),
            render: ({ row }) => <>{row.customer_abbreviation}</>,
          },
          {
            title: translate('Value'),
            render: ({ row }) => (
              <>
                {activeQuota?.tooltipValueFormatter
                  ? activeQuota.tooltipValueFormatter(row.value)
                  : row.value}
              </>
            ),

            orderField: 'value',
          },
        ]}
        showPageSizeSelector={true}
        filters={<CustomerQuotasFilter />}
        hideClearFilters
        tableActions={
          <QuotasAnalytics
            data={tableProps.rows}
            loading={tableProps.loading}
          />
        }
        formId={CustomerQuotasFilterFormId}
      />
    </>
  );
};
