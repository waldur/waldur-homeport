import { useSelector } from 'react-redux';

import { useTable } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

export const usePermissionsTable = (type) => {
  const user = useSelector(getUser);
  const permissions =
    user.permissions?.filter((perm) => perm.scope_type === type) || [];
  return useTable({
    table: `${type}Permissions`,
    fetchData: () =>
      Promise.resolve({
        rows: permissions,
        resultCount: permissions.length,
      }),
  });
};
