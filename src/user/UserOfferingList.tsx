import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { UserOfferingListPlaceholder } from '@waldur/user/UserOfferingListPlaceholder';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

interface OwnProps {
  user?: UserDetails;
}

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Username'),
      render: ({ row }) => <>{row.username || 'N/A'}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => formatDateTime(row.created),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('remote accounts')}
      placeholderComponent={<UserOfferingListPlaceholder />}
      showPageSizeSelector={true}
      hasQuery={true}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'UserOfferingList',
  fetchData: createFetcher('marketplace-offering-users'),
  mapPropsToFilter: (props) => ({
    user_uuid: props.user?.uuid,
  }),
  queryField: 'query',
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  user: ownProps.user || getUser(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const UserOfferingList = enhance(TableComponent);
