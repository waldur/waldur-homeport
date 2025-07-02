import { FunctionComponent } from 'react';

import Avatar from '@waldur/core/Avatar';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationActions } from '@waldur/invitations/InvitationActions';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import Table from '@waldur/table/Table';
import { RoleField } from '@waldur/user/affiliations/RoleField';

export const InvitationsList: FunctionComponent<{
  table;
  hideRole;
  cardBordered?;
  hasActionBar?;
  fullWidth?;
}> = ({ table, hideRole, cardBordered, hasActionBar, fullWidth }) => {
  return (
    <Table
      {...table}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              <Avatar name={row?.email} circle />
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
              render: RoleField,
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
      rowActions={({ row, fetch }) => (
        <InvitationActions invitation={row} refetch={fetch} />
      )}
      title={translate('Invitations')}
      verboseName={translate('invitations')}
      cardBordered={cardBordered}
      hasActionBar={hasActionBar}
      hasQuery={true}
      fullWidth={fullWidth}
      minHeight="auto"
      expandableRow={InvitationExpandableRow}
    />
  );
};
