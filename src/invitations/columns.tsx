import { Invitation } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Column } from '@/table/types';
import { RoleField } from '@/user/affiliations/RoleField';
import { exportRoleField } from '@/user/affiliations/RolePopover';

import { formatInvitationState } from './choices';

export const getInvitationColumns = (): Column<Invitation>[] => [
  {
    title: translate('Email'),
    render: ({ row }) => (
      <div className="d-flex align-items-center gap-1">
        {row.email}
        <CopyToClipboardButton value={row.email} />
      </div>
    ),
    orderField: 'email',
    export: (row) => row.email,
  },
  {
    title: translate('Role'),
    render: RoleField,
    export: exportRoleField,
  },
  {
    title: translate('Status'),
    orderField: 'state',
    render: ({ row }) => formatInvitationState(row.state),
    filter: 'state',
    inlineFilter: (row) => [
      { value: row.state, label: formatInvitationState(row.state) },
    ],
    export: (row) => row.state,
  },
  {
    title: translate('Created at'),
    orderField: 'created',
    render: ({ row }) => formatDate(row.created),
    export: (row) => formatDate(row.created),
  },
  {
    title: translate('Invited by'),
    orderField: 'created_by',
    render: ({ row }) => row.created_by_full_name,
    export: (row) => row.created_by_full_name,
  },
  {
    title: translate('Expires at'),
    orderField: 'expires',
    render: ({ row }) => formatDate(row.expires),
    export: (row) => formatDate(row.expires),
  },
];
