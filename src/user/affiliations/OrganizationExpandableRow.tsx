import React from 'react';
import { Container } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { getList } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';
import { Customer, User } from '@waldur/workspace/types';

import { PermissionDetails } from './PermissionDetails';

async function loadData(customer: Customer, user: User) {
  const permissions = await getList('/customer-permissions/', {
    user: user.uuid,
    customer: customer.uuid,
  });

  return {
    permissions,
  };
}

export const OrganizationExpandableRow: React.FC<{
  row: Customer;
}> = ({ row }) => {
  const user = useSelector(getUser);
  const { loading, error, value } = useAsync(
    () => loadData(row, user),
    [row, user],
  );
  if (loading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <>{translate('Unable to load project resources.')}</>;
  } else {
    return value.permissions.length === 0 ? (
      <>{translate('No permissions data.')}</>
    ) : (
      <Container>
        {value.permissions.map((permission, index) => (
          <PermissionDetails key={index} permission={permission} />
        ))}
      </Container>
    );
  }
};
