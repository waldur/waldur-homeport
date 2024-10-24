import { FC } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { formatYesNo } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { ProjectCreateCreditButton } from './ProjectCreateCreditButton';
import { ProjectCreditActions } from './ProjectCreditActions';
import { ProjectCredit } from './types';

export const ProjectCreditsList: FC = () => {
  const tableProps = useTable({
    table: 'ProjectCreditsList',
    fetchData: createFetcher('project-credits'),
    queryField: 'query',
  });

  return (
    <Table<ProjectCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.project_name),
          orderField: 'project_name',
          export: 'project_name',
        },
        {
          title: translate('Allocated credit'),
          render: ({ row }) => defaultCurrency(row.value),
          orderField: 'value',
          export: 'value',
        },
        {
          title: translate('Eligible offerings'),
          render: ({ row }) => (
            <>{row.offerings.map((offering) => offering.name).join(', ')}</>
          ),
          export: (row) =>
            row.offerings.map((offering) => offering.name).join(', '),
        },
        {
          title: translate('Use organization credit'),
          render: ({ row }) => <>{formatYesNo(row.use_organisation_credit)}</>,
          orderField: 'use_organisation_credit',
          export: (row) => formatYesNo(row.use_organisation_credit),
        },
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={ProjectCreditActions}
      tableActions={<ProjectCreateCreditButton refetch={tableProps.fetch} />}
    />
  );
};
