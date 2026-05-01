import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProjectCredit, projectCreditsList } from 'waldur-js-client';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { ProjectLink } from '@/project/ProjectLink';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

import { COMMON_CREDIT_COLUMNS } from './constants';
import { CreditExpandableRow } from './CreditExpandableRow';
import { ProjectCreateCreditButton } from './ProjectCreateCreditButton';
import { ProjectCreditActions } from './ProjectCreditActions';

export const ProjectCreditsList: FC = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({ customer_uuid: customer.uuid }),
    [customer.uuid],
  );
  const tableProps = useTable({
    table: 'ProjectCreditsList',
    fetchData: createFetcher(projectCreditsList),
    queryField: 'query',
    filter,
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
      showPageSizeSelector
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
