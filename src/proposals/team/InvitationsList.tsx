import { FunctionComponent } from 'react';

import Avatar from '@waldur/core/Avatar';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationCancelButton } from '@waldur/invitations/actions/InvitationCancelButton';
import { InvitationSendButton } from '@waldur/invitations/actions/InvitationSendButton';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { RoleField } from '@waldur/invitations/RoleField';
import { Table } from '@waldur/table';

export const InvitationsList: FunctionComponent<{ table; hideRole }> = ({
  table,
  hideRole,
}) => {
  return (
    <Table
      {...table}
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
              <CopyToClipboardButton value={row.email} />
            </div>
          ),
          orderField: 'email',
        },
        hideRole
          ? undefined
          : {
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
      ].filter(Boolean)}
      rowActions={({ row }) => (
        <>
          <InvitationSendButton row={row} />
          <InvitationCancelButton row={row} refetch={table.fetch} />
        </>
      )}
      title={translate('Invitations')}
      verboseName={translate('invitations')}
      hasQuery={true}
      expandableRow={InvitationExpandableRow}
    />
  );
};
