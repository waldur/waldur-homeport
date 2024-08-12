import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import Avatar from '@waldur/core/Avatar';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { InvitationExpandableRow } from '@waldur/invitations/InvitationExpandableRow';
import { useTitle } from '@waldur/navigation/title';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import { getCustomer } from '@waldur/workspace/selectors';

import { InvitationCreateButton } from './actions/create/InvitationCreateButton';
import { InvitationActions } from './InvitationActions';
import { InvitationsFilter } from './InvitationsFilter';
import { InvitationsMultiSelectActions } from './InvitationsMultiSelectActions';
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
              <CopyToClipboardButton value={row.email} />
            </div>
          ),
          orderField: 'email',
          export: (row) => row.email,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
          export: exportRoleField,
        },
        {
          title: translate('Status'),
          orderField: 'state',
          render: ({ row }) => row.state,
          filter: 'state',
          export: (row) => row.state,
        },
        {
          title: translate('Created at'),
          orderField: 'created',
          render: ({ row }) => formatDate(row.created),
          export: (row) => formatDate(row.created),
        },
        {
          title: translate('Expires at'),
          orderField: 'expires',
          render: ({ row }) => formatDate(row.expires),
          export: (row) => formatDate(row.expires),
        },
      ]}
      verboseName={translate('team invitations')}
      tableActions={
        <InvitationCreateButton
          roleTypes={['customer', 'project']}
          refetch={props.fetch}
          enableBulkUpload={true}
        />
      }
      hasQuery={true}
      enableExport
      rowActions={({ row }) => (
        <InvitationActions invitation={row} refetch={props.fetch} />
      )}
      expandableRow={InvitationExpandableRow}
      enableMultiSelect
      multiSelectActions={InvitationsMultiSelectActions}
    />
  );
};
