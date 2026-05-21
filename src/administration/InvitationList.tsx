import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { Invitation, userInvitationsList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { formatInvitationState } from '@/invitations/choices';
import { useTitle } from '@/navigation/title';
import { RoleType } from '@/permissions/types';
import { formatRoleType } from '@/permissions/utils';
import { createFetcher } from '@/table/api';
import {
  selectUserInvitationsFilter,
  UserInvitationsFilter,
  UserInvitationsFilterFormId,
} from '@/table/generated/UserInvitationsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { RoleField } from '@/user/affiliations/RoleField';

import { InvitationScopeLink } from './InvitationScopeLink';

const InvitationListTable: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const { values } = useFormState();

  const filter = useMemo(() => selectUserInvitationsFilter(values), [values]);

  const props = useTable({
    table: 'admin-invitations',
    fetchData: createFetcher(userInvitationsList),
    queryField: 'email',
    filter,
  });

  return (
    <Table<Invitation>
      {...props}
      filters={<UserInvitationsFilter />}
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
          render: ({ row }) => formatRoleType(row.scope_type as RoleType),
          filter: 'scope_type',
          inlineFilter: (row) => ({
            value: row.scope_type,
            label: formatRoleType(row.scope_type as RoleType),
          }),
        },
        {
          title: translate('Scope'),
          render: InvitationScopeLink,
        },
        {
          title: translate('Role'),
          render: RoleField,
          filter: 'role',
          inlineFilter: (row) =>
            ENV.roles.find((role) => role.name === row.role_name),
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => formatInvitationState(row.state),
          filter: 'state',
          inlineFilter: (row) => [
            { value: row.state, label: formatInvitationState(row.state) },
          ],
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
      formId={UserInvitationsFilterFormId}
    />
  );
};

export const InvitationList = (props) => (
  <Form
    id={UserInvitationsFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <InvitationListTable {...props} />}
  </Form>
);
