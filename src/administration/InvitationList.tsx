import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RoleField } from '@waldur/invitations/RoleField';
import { useTitle } from '@waldur/navigation/title';
import { formatRoleType } from '@waldur/permissions/utils';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { InvitationScopeLink } from './InvitationScopeLink';
import { InvitationsFilter } from './InvitationsFilter';

export const InvitationList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const filterForm: any = useSelector(getFormValues('AdminInvitationsFilter'));
  const filter = useMemo(
    () => ({
      state: filterForm?.state?.map((option) => option.value),
      role_uuid: filterForm?.role?.uuid,
      customer_uuid: filterForm?.organization?.uuid,
      scope_type: filterForm?.scope_type?.value,
    }),
    [filterForm],
  );
  const props = useTable({
    table: 'admin-invitations',
    fetchData: createFetcher('user-invitations'),
    queryField: 'email',
    filter,
  });

  return (
    <Table
      {...props}
      filters={<InvitationsFilter />}
      columns={[
        {
          title: translate('Email'),
          render: ({ row }) => (
            <div className="d-flex align-items-center gap-1">
              {row.email}
              <CopyToClipboardButton value={row.email} />
            </div>
          ),
          orderField: 'email',
        },
        {
          title: translate('Scope type'),
          render: ({ row }) => formatRoleType(row.scope_type),
          filter: 'scope_type',
        },
        {
          title: translate('Scope'),
          render: InvitationScopeLink,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
          filter: 'role',
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => row.state,
          filter: 'state',
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
      verboseName={translate('invitations')}
      hasQuery={true}
    />
  );
};
