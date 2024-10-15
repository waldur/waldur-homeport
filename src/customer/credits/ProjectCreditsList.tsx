import { FC } from 'react';

import { ENV } from '@waldur/configs/default';
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
          title: translate('Allocated credit ({currency})', {
            currency: ENV.plugins.WALDUR_CORE.CURRENCY_NAME,
          }),
          render: ({ row }) => <>{row.value}</>,
          orderField: 'value',
          export: 'value',
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
