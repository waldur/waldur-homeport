import { useSelector } from 'react-redux';
import { customerQuotasList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import {
  CustomerQuotasFilter,
  selectCustomerQuotasFilter,
} from '@/table/generated/CustomerQuotasFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ReportingTitle } from '../ReportingTitle';

import { getQuotas } from './constants';
import { QuotasAnalytics } from './QuotasAnalytics';
import { CustomerQuota } from './types';

export const CustomerQuotasList = () => {
  const filter = useSelector(selectCustomerQuotasFilter);
  const tableProps = useTable({
    table: 'CustomerQuotasList',
    fetchData: createFetcher(customerQuotasList),
    filter,
  });
  const formValues = useSelector(selectCustomerQuotasFilter);

  const activeQuota = getQuotas(true).find(
    (q) => q.key === formValues?.quota_name,
  );

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
      />
    </>
  );
};
