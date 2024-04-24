import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { UserOfferingListPlaceholder } from '@waldur/user/UserOfferingListPlaceholder';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

interface OwnProps {
  user?: UserDetails;
}

export const UserOfferingList: FunctionComponent<OwnProps> = (props) => {
  const currentUser = useSelector(getUser);
  const user = props.user || currentUser;
  const filter = useMemo(
    () => ({
      user_uuid: user?.uuid,
    }),
    [user],
  );
  const tableProps = useTable({
    table: 'UserOfferingList',
    fetchData: createFetcher('marketplace-offering-users'),
    filter,
    queryField: 'query',
  });
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
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('remote accounts')}
      placeholderComponent={<UserOfferingListPlaceholder />}
      showPageSizeSelector={true}
      hasQuery={true}
    />
  );
};
