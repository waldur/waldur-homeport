import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  Invitation,
  RoleType,
  User,
  userInvitationsList,
  UserInvitationsListData,
} from 'waldur-js-client';

import { InvitationsFilter } from '@waldur/administration/InvitationsFilter';
import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationStateBadge } from '@waldur/invitations/InvitationStateBadge';
import { formatRoleType } from '@waldur/permissions/utils';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RoleField } from '../affiliations/RoleField';

interface ActiveInvitationsListProps {
  user: User;
}

export const ActiveInvitationsList: FunctionComponent<
  ActiveInvitationsListProps
> = ({ user }) => {
  const filterForm: any = useSelector(getFormValues('AdminInvitationsFilter'));
  const filter = useMemo(
    (): UserInvitationsListData['query'] => ({
      state: ['pending', 'project'],
      email_exact: user.email,
      role_uuid: filterForm?.role?.uuid,
      customer_uuid: filterForm?.organization?.uuid,
      scope_type: filterForm?.scope_type?.value,
    }),
    [user.email, filterForm],
  );

  const props = useTable({
    table: 'ActiveInvitations',
    fetchData: createFetcher(userInvitationsList),
    queryField: 'scope_name',
    filter,
  });

  const columns = [
    {
      title: translate('Invited by'),
      render: ({ row }) => (
        <div className="content-wrapper gap-2">
          <Avatar
            name={row.created_by_full_name || row.created_by_username}
            src={row.created_by_image}
            circle
            size={32}
          />
          <p className="mb-0">
            {row.created_by_full_name ||
              row.created_by_username ||
              DASH_ESCAPE_CODE}
          </p>
        </div>
      ),
    },
    {
      title: translate('Role'),
      render: RoleField,
      filter: 'role',
    },
    {
      title: translate('Type'),
      render: ({ row }) => formatRoleType(row.scope_type as RoleType),
      filter: 'scope_type',
    },
    {
      title: translate('Scope'),
      render: ({ row }) => row.scope_name || DASH_ESCAPE_CODE,
    },
    {
      title: translate('Status'),
      render: ({ row }) => <InvitationStateBadge state={row.state} />,
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
  ];

  return (
    <Table<Invitation>
      {...props}
      columns={columns}
      verboseName={translate('Active invitations')}
      title={translate('Active invitations')}
      subtitle={translate('Pending invitations sent to your email: {email}', {
        email: user.email,
      })}
      showPageSizeSelector={true}
      initialPageSize={5}
      filters={<InvitationsFilter showStateFilter={false} />}
      hasQuery
    />
  );
};
