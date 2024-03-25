import { post } from '@waldur/core/api';

export const addScopeUser = ({
  scope,
  user,
  role,
  expiration_time,
}: {
  scope;
  user;
  role;
  expiration_time?;
}) =>
  post(`${scope}add_user/`, {
    user,
    role,
    expiration_time,
  });

export const deleteScopeUser = ({ scope, user, role }) =>
  post(`${scope}delete_user/`, {
    user,
    role,
  });
