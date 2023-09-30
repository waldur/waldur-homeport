import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { fetchAllCustomerUsers } from '@waldur/permissions/api';
import { getCustomerRoles } from '@waldur/permissions/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { UserRoleGroup } from './UserRoleGroup';

export const CustomerUsersBadge = () => {
  const customer = useSelector(getCustomer);
  const {
    loading,
    error,
    value: users,
  } = useAsync(
    async () => await fetchAllCustomerUsers(customer.uuid),
    [customer],
  );

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load users')}</>
  ) : (
    <div className="d-flex justify-content-start align-items-xl-center flex-xl-row flex-column gap-xl-6">
      {getCustomerRoles().map((role) => (
        <UserRoleGroup key={role.value} role={role} users={users} />
      ))}
    </div>
  );
};
