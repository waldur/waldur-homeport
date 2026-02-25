import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { customerQuotasList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  CustomerQuotasFilter,
  CustomerQuotasFilterFormId,
  selectCustomerQuotasFilter,
} from '@waldur/table/generated/CustomerQuotasFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { getQuotas } from './constants';
import { QuotasAnalytics } from './QuotasAnalytics';
import { CustomerQuota } from './types';

export const CustomerQuotasList = () => {
  useReportBreadcrumbs({ currentReport: 'quotas', category: 'resources' });

  const filter = useSelector(selectCustomerQuotasFilter);
  const tableProps = useTable({
    table: 'CustomerQuotasList',
    fetchData: createFetcher(customerQuotasList),
    filter,
  });
  const formValues = useSelector<any, { quota_name: any }>(
    getFormValues(CustomerQuotasFilterFormId) as any,
  );

  const activeQuota = getQuotas(true).find(
    (q) => q.key === formValues?.quota_name?.value,
  );

  return (
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
        <QuotasAnalytics data={tableProps.rows} loading={tableProps.loading} />
      }
    />
  );
};
