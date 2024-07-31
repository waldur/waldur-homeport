import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { GroupInvitationCreateButton } from '@waldur/invitations/actions/GroupInvitationCreateButton';
import { GROUP_INVITATIONS_FILTER_FORM_ID } from '@waldur/invitations/constants';
import { GroupInvitationRowActions } from '@waldur/invitations/GroupInvitationRowActions';
import { GroupInvitationsFilter } from '@waldur/invitations/GroupInvitationsFilter';
import { GroupInvitationsListExpandableRow } from '@waldur/invitations/GroupInvitationsListExpandableRow';
import { RoleField } from '@waldur/invitations/RoleField';
import { Table, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { useTable } from '@waldur/table/utils';
import { exportRoleField } from '@waldur/user/affiliations/RolePopover';
import { getCustomer } from '@waldur/workspace/selectors';

const mapStateToFilter = createSelector(
  getCustomer,
  getFormValues(GROUP_INVITATIONS_FILTER_FORM_ID),
  (customer, filterValues) => ({
    ...filterValues,
    customer_uuid: customer.uuid,
  }),
);

export const GroupInvitationsList: FunctionComponent<{}> = () => {
  const filter = useSelector(mapStateToFilter);
  const props = useTable({
    table: 'group-invitations',
    fetchData: createFetcher('user-group-invitations'),
    filter,
  });
  return (
    <Table
      {...props}
      filters={<GroupInvitationsFilter />}
      columns={[
        {
          title: translate('Created by'),
          render: ({ row }) => row.created_by_full_name,
          export: (row) => row.created_by_full_name,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
          export: exportRoleField,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
          export: (row) => formatDateTime(row.created),
        },
        {
          title: translate('Expires at'),
          render: ({ row }) => formatDateTime(row.expires),
          export: (row) => formatDateTime(row.expires),
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
          filter: 'is_active',
          export: (row) => (row.is_active ? translate('Yes') : translate('No')),
        },
      ]}
      verboseName={translate('group invitations')}
      actions={<GroupInvitationCreateButton refetch={props.fetch} />}
      hoverableRow={({ row }) => (
        <GroupInvitationRowActions row={row} refetch={props.fetch} />
      )}
      expandableRow={GroupInvitationsListExpandableRow}
      enableExport
    />
  );
};
