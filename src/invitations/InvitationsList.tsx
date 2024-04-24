import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import Avatar from '@waldur/core/Avatar';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { useTitle } from '@waldur/navigation/title';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvitationCreateButton } from './actions/create/InvitationCreateButton';
import { InvitationCancelButton } from './actions/InvitationCancelButton';
import { InvitationSendButton } from './actions/InvitationSendButton';
import { InvitationsFilter } from './InvitationsFilter';
import { RoleField } from './RoleField';

export const InvitationsList: FunctionComponent = () => {
  useTitle(translate('Invitations'));
  const customer = useSelector(getCustomer);
  const stateFilter: any = useSelector(getFormValues('InvitationsFilter'));
  const filter = useMemo(
    () => ({
      ...stateFilter,
      state: stateFilter?.state?.map((option) => option.value),
      customer_uuid: customer.uuid,
    }),
    [stateFilter, customer],
  );
  const props = useTable({
    table: 'user-invitations',
    fetchData: createFetcher('user-invitations'),
    filter,
    queryField: 'email',
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
              <Avatar
                className="symbol symbol-25px"
                name={row.email}
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
      verboseName={translate('team invitations')}
      actions={
        <InvitationCreateButton
          roleTypes={['customer', 'project']}
          refetch={props.fetch}
        />
      }
      hasQuery={true}
      hoverableRow={({ row }) => (
        <>
          <InvitationSendButton invitation={row} />
          <InvitationCancelButton invitation={row} refetch={props.fetch} />
        </>
      )}
      expandableRow={InvitationExpandableRow}
    />
  );
};
