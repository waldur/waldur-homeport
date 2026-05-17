import { useMemo } from 'react';
import {
  callProposalProjectRoleMappingsList,
  CallProposalProjectRoleMappingsListData,
  ProposalProjectRoleMapping,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { formatRole } from '@/permissions/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { RoleMappingCreateButton } from './RoleMappingCreateButton';
import { RoleMappingDeleteAction } from './RoleMappingDeleteAction';
import { RoleMappingEditAction } from './RoleMappingEditAction';

const CallRoleMappingsRowActions = ({ row, refetch }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[RoleMappingEditAction, RoleMappingDeleteAction].filter(Boolean)}
    />
  );
};

export const CallRoleMappingsList = (props) => {
  const filter = useMemo(
    (): CallProposalProjectRoleMappingsListData['query'] => ({
      call_uuid: props.call.uuid,
    }),
    [props.call],
  );
  const tableProps = useTable({
    table: 'callRoleMappingsList',
    fetchData: createFetcher(callProposalProjectRoleMappingsList),
    queryField: 'query',
    filter,
  });

  const columns: Column<ProposalProjectRoleMapping>[] = [
    {
      title: translate('Proposal role'),
      render: ({ row }) => formatRole(row.proposal_role),
    },
    {
      title: translate('Project role'),
      render: ({ row }) => renderFieldOrDash(formatRole(row.project_role)),
    },
  ];

  return (
    <Table<ProposalProjectRoleMapping>
      {...tableProps}
      columns={columns}
      tableActions={
        <RoleMappingCreateButton refetch={tableProps.fetch} call={props.call} />
      }
      title={translate('Proposal project role mappings')}
      rowActions={({ row }) => (
        <CallRoleMappingsRowActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector
    />
  );
};
