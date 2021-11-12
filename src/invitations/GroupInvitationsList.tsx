import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { GroupInvitationCreateButton } from '@waldur/invitations/actions/GroupInvitationCreateButton';
import { GROUP_INVITATIONS_FILTER_FORM_ID } from '@waldur/invitations/constants';
import { GroupInvitationRowActions } from '@waldur/invitations/GroupInvitationRowActions';
import { GroupInvitationsFilter } from '@waldur/invitations/GroupInvitationsFilter';
import { GroupInvitationsListExpandableRow } from '@waldur/invitations/GroupInvitationsListExpandableRow';
import { RoleField } from '@waldur/invitations/RoleField';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { TableOptionsType } from '@waldur/table/types';
import { getCustomer } from '@waldur/workspace/selectors';

const TableComponent: FunctionComponent<any> = (props) => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Created by'),
          render: ({ row }) => row.created_by_full_name,
        },
        {
          title: translate('Role'),
          render: ({ row }) => <RoleField invitation={row} />,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
        },
        {
          title: translate('Expires at'),
          render: ({ row }) => formatDateTime(row.expires),
        },
        {
          title: translate('Active'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <GroupInvitationRowActions row={row} refreshList={props.fetch} />
          ),
        },
      ]}
      verboseName={translate('group invitations')}
      actions={<GroupInvitationCreateButton refreshList={props.fetch} />}
      expandableRow={GroupInvitationsListExpandableRow}
    />
  );
};

const mapPropsToFilter = (props) => ({
  ...props.filter,
  customer: props.customer.uuid,
});

const TableOptions: TableOptionsType = {
  table: 'group-invitations',
  fetchData: createFetcher('user-group-invitations'),
  mapPropsToFilter,
};

const mapStateToProps = (state: RootState) => ({
  customer: getCustomer(state),
  filter: getFormValues(GROUP_INVITATIONS_FILTER_FORM_ID)(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

const GroupInvitationsListComponent = enhance(TableComponent);

export const GroupInvitationsList: FunctionComponent = () => (
  <>
    <GroupInvitationsFilter />
    <GroupInvitationsListComponent />
  </>
);
