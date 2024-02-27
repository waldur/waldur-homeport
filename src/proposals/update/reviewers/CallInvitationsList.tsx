import { FunctionComponent, useMemo } from 'react';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { InvitationCancelButton } from '@waldur/invitations/actions/InvitationCancelButton';
import { InvitationSendButton } from '@waldur/invitations/actions/InvitationSendButton';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { RoleField } from '@waldur/invitations/RoleField';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

export const CallInvitationsList: FunctionComponent<{ call }> = (props) => {
  const filter = useMemo(() => ({ scope: props.call.url }), [props.call]);
  const tableProps = useTable({
    table: 'user-invitations',
    fetchData: createFetcher('user-invitations'),
    queryField: 'email',
    filter,
  });
  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar
                className="symbol symbol-25px"
                name={row?.email}
                size={25}
              />
              {row.email}
            </div>
          ),
          orderField: 'email',
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => row.state,
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
        },
        {
          title: translate('Expires at'),
          orderField: 'expires',
          render: ({ row }) => formatDate(row.expires),
        },
      ]}
      hoverableRow={({ row }) => (
        <>
          <InvitationSendButton invitation={row} />
          <InvitationCancelButton invitation={row} refetch={tableProps.fetch} />
        </>
      )}
      title={translate('Invitations')}
      verboseName={translate('invitations')}
      actions={
        <InvitationCreateButton
          scope={props.call}
          roleTypes={['call']}
          refetch={tableProps.fetch}
        />
      }
      hasQuery={true}
      expandableRow={InvitationExpandableRow}
    />
  );
};
