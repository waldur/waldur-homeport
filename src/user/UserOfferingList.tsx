import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';
import { UserOfferingListPlaceholder } from '@waldur/user/UserOfferingListPlaceholder';
import { getUser } from '@waldur/workspace/selectors';

export const TableComponent: FunctionComponent<any> = (props) => {
  useTitle(translate('Remote accounts'));
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
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'UserOfferingList',
  fetchData: createFetcher('marketplace-offering-users'),
  mapPropsToFilter: (props) => ({
    user_uuid: props.user?.uuid,
  }),
};

const mapStateToProps = (state: RootState) => ({
  user: getUser(state),
});

const enhance = compose(connect(mapStateToProps), connectTable(TableOptions));

export const UserOfferingList = enhance(TableComponent);
