import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { AddUserButton } from './AddUserButton';
import { CallUsersListPlaceholder } from './CallUsersListPlaceholder';
import { UserRemoveButton } from './UserRemoveButton';

interface CallUsersListProps {
  call: ProposalCall;
}

export const CallUsersList: FC<CallUsersListProps> = (props) => {
  const tableProps = useTable({
    table: 'CallUsersListList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/list_users`,
    ),
  });

  return (
    <Table<GenericPermission>
      {...tableProps}
      className="mb-7"
      placeholderComponent={
        <CallUsersListPlaceholder
          refetch={tableProps.fetch}
          call={props.call}
        />
      }
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.user_email}</>,
        },
        {
          title: translate('Role'),
          render: RoleField,
        },
      ]}
      title={translate('Users')}
      verboseName={translate('users')}
      actions={<AddUserButton refetch={tableProps.fetch} call={props.call} />}
      hoverableRow={({ row }) => (
        <UserRemoveButton
          permission={row}
          refetch={tableProps.fetch}
          call={props.call}
        />
      )}
    />
  );
};