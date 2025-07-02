import { FC } from 'react';
import { useSelector } from 'react-redux';
import { ProjectCredit } from 'waldur-js-client';

import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { translate } from '@waldur/i18n';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getCustomer } from '@waldur/workspace/selectors';

import { COMMON_CREDIT_COLUMNS } from './constants';
import { CreditExpandableRow } from './CreditExpandableRow';
import { ProjectCreateCreditButton } from './ProjectCreateCreditButton';
import { ProjectCreditActions } from './ProjectCreditActions';

export const ProjectCreditsList: FC = () => {
  const customer = useSelector(getCustomer);
  const tableProps = useTable({
    table: 'ProjectCreditsList',
    fetchData: createFetcher('project-credits', {
      params: { customer_uuid: customer.uuid },
    }),
    queryField: 'query',
  });

  return (
    <Table<ProjectCredit>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <ProjectLink
              row={{ uuid: row.project_uuid, name: row.project_name }}
            >
              {row.project_name}
            </ProjectLink>
          ),

          orderField: 'project_name',
          export: 'project_name',
        },
        ...COMMON_CREDIT_COLUMNS,
      ]}
      title={translate('Credit management')}
      verboseName={translate('Credits')}
      hasQuery
      enableExport
      rowActions={ProjectCreditActions}
      expandableRow={CreditExpandableRow}
      tableActions={
        <>
          <FilteredEventsButton
            filter={{ feature: 'credits', customer_uuid: customer.uuid }}
          />

          <ProjectCreateCreditButton refetch={tableProps.fetch} />
        </>
      }
    />
  );
};
