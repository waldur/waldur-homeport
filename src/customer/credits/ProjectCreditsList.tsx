import { FC, useMemo } from 'react';
import { ProjectCredit, projectCreditsList } from 'waldur-js-client';

import { FilteredEventsButton } from '@/events/FilteredEventsButton';
import { translate } from '@/i18n';
import { ProjectLink } from '@/project/ProjectLink';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { COMMON_CREDIT_COLUMNS } from './constants';
import { CreditExpandableRow } from './CreditExpandableRow';
import { ProjectCreateCreditButton } from './ProjectCreateCreditButton';
import {
  ProjectCreditActions,
  ProjectCreditReadOnlyActions,
} from './ProjectCreditActions';

export const ProjectCreditsList: FC = () => {
  const customer = useCustomer();
  const user = useUser();
  // The page is open to anyone who may view accounting; creating, editing and
  // deleting a credit stays with owners, as Mastermind checks.
  const canManage = checkIsOwnerOrStaff(customer, user);
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
      rowActions={
        canManage ? ProjectCreditActions : ProjectCreditReadOnlyActions
      }
      expandableRow={CreditExpandableRow}
      tableActions={
        <>
          <FilteredEventsButton
            filter={{ feature: 'credits', customer_uuid: customer.uuid }}
          />

          {canManage && (
            <ProjectCreateCreditButton refetch={tableProps.fetch} />
          )}
        </>
      }
    />
  );
};
