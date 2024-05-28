import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

interface OwnProps {
  user?: UserDetails;
  hasActionBar?: boolean;
}

export const UserOfferingList: FunctionComponent<OwnProps> = ({
  hasActionBar = true,
  ...props
}) => {
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
      showPageSizeSelector={true}
      hasQuery={true}
      hasActionBar={hasActionBar}
    />
  );
};
