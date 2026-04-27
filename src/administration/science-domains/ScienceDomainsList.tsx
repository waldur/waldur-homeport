import { FunctionComponent } from 'react';
import { ScienceDomain, scienceDomainsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ScienceDomainCreateButton } from './ScienceDomainCreateButton';
import { ScienceDomainLoadPresetButton } from './ScienceDomainLoadPresetButton';
import { ScienceDomainRowActions } from './ScienceDomainRowActions';
import { ScienceSubDomainsExpandableRow } from './ScienceSubDomainsExpandableRow';

export const ScienceDomainsList: FunctionComponent = () => {
  const tableProps = useTable({
    table: 'ScienceDomainsList',
    fetchData: createFetcher(scienceDomainsList),
    queryField: 'name',
  });

  return (
    <Table<ScienceDomain>
      {...tableProps}
      columns={[
        {
          title: translate('Code'),
          render: ({ row }) => <>{row.code}</>,
          orderField: 'code',
        },
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
          orderField: 'name',
          copyField: (row) => row.name,
        },
        {
          title: translate('Sub-domains'),
          render: ({ row }) =>
            row.subdomains_count != null
              ? row.subdomains_count
              : DASH_ESCAPE_CODE,
        },
        {
          title: translate('Created'),
          render: ({ row }) => renderFieldOrDash(formatDateTime(row.created)),
        },
      ]}
      verboseName={translate('Science domains')}
      rowActions={ScienceDomainRowActions}
      tableActions={
        <>
          <ScienceDomainLoadPresetButton refetch={tableProps.fetch} />
          <ScienceDomainCreateButton refetch={tableProps.fetch} />
        </>
      }
      expandableRow={ScienceSubDomainsExpandableRow}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasQuery={true}
    />
  );
};
