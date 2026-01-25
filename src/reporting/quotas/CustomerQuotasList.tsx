import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { customerQuotasList } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { CustomerQuotasFilter } from './CustomerQuotasFilter';
import { QuotasAnalytics } from './QuotasAnalytics';
import { CustomerQuota, QuotaChoice } from './types';

const filterSelector = createSelector(
  getFormValues('CustomerQuotasFilter'),
  (filters: { quota: { key } }) => ({ quota_name: filters?.quota.key }),
);

export const CustomerQuotasList = () => {
  useReportBreadcrumbs({ currentReport: 'quotas', category: 'resources' });

  const filter = useSelector(filterSelector);
  const tableProps = useTable({
    table: 'CustomerQuotasList',
    fetchData: createFetcher(customerQuotasList),
    filter,
  });
  const formValues = useSelector<any, { quota: QuotaChoice }>(
    getFormValues('CustomerQuotasFilter') as any,
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
              {formValues.quota.tooltipValueFormatter
                ? formValues.quota.tooltipValueFormatter(row.value)
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
