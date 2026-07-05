import { FC, useMemo } from 'react';
import { customerAffiliatesList, CustomerAffiliate } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { AffiliateLinkExpandableRow } from '@/customer/affiliate-earnings/AffiliateLinkExpandableRow';
import { OrganizationLink } from '@/customer/list/OrganizationLink';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AffiliateLinkActions } from './AffiliateLinkActions';
import { AffiliateLinkCreateAction } from './AffiliateLinkCreateAction';

export const AffiliateLinksList: FC = () => {
  const filter = useMemo(() => ({}), []);

  const tableProps = useTable({
    table: 'customer-affiliates',
    fetchData: createFetcher(customerAffiliatesList),
    filter,
  });

  const columns = useMemo<Array<Column<CustomerAffiliate>>>(
    () => [
      {
        title: translate('Referred organization'),
        orderField: 'customer_name',
        render: ({ row }) =>
          row.customer_name ? (
            <OrganizationLink uuid={row.customer_uuid}>
              {row.customer_name}
            </OrganizationLink>
          ) : (
            renderFieldOrDash(row.customer_name)
          ),
        export: (row) => row.customer_name,
      },
      {
        title: translate('Affiliate organization'),
        orderField: 'affiliate_name',
        render: ({ row }) =>
          row.affiliate_name ? (
            <OrganizationLink uuid={row.affiliate_uuid}>
              {row.affiliate_name}
            </OrganizationLink>
          ) : (
            renderFieldOrDash(row.affiliate_name)
          ),
        export: (row) => row.affiliate_name,
      },
      {
        title: translate('Fee %'),
        orderField: 'fee_percent',
        render: ({ row }) => renderFieldOrDash(row.fee_percent),
        export: (row) => row.fee_percent,
      },
      {
        title: translate('Active'),
        orderField: 'is_active',
        render: ({ row }) =>
          row.is_active ? translate('Yes') : translate('No'),
        export: (row) => (row.is_active ? translate('Yes') : translate('No')),
      },
      {
        title: translate('Start date'),
        orderField: 'start_date',
        render: ({ row }) =>
          renderFieldOrDash(row.start_date && formatDate(row.start_date)),
        export: (row) => (row.start_date ? formatDate(row.start_date) : ''),
      },
      {
        title: translate('End date'),
        orderField: 'end_date',
        render: ({ row }) =>
          renderFieldOrDash(row.end_date && formatDate(row.end_date)),
        export: (row) => (row.end_date ? formatDate(row.end_date) : ''),
      },
      {
        title: translate('Total earned'),
        render: ({ row }) =>
          renderFieldOrDash(defaultCurrency(row.total_earned)),
        export: (row) => defaultCurrency(row.total_earned),
      },
      {
        title: translate('Created'),
        orderField: 'created',
        render: ({ row }) => formatDate(row.created),
        export: (row) => formatDate(row.created),
      },
    ],
    [],
  );

  return (
    <Table<CustomerAffiliate>
      {...tableProps}
      columns={columns}
      title={translate('Affiliate program')}
      verboseName={translate('Affiliate links')}
      hasQuery={true}
      enableExport
      expandableRow={AffiliateLinkExpandableRow}
      rowActions={({ row }) => (
        <AffiliateLinkActions row={row} refetch={tableProps.fetch} />
      )}
      tableActions={<AffiliateLinkCreateAction refetch={tableProps.fetch} />}
    />
  );
};
