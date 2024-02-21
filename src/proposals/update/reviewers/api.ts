import { post } from '@waldur/core/api';

export const addCallUser = ({
  call,
  user,
  role,
  expiration_time,
}: {
  call;
  user;
  role;
  expiration_time?;
}) =>
  post(`/proposal-protected-calls/${call}/add_user/`, {
    user,
    role,
    expiration_time,
  });

export const deleteCallUser = ({ call, user, role }) =>
  post(`/proposal-protected-calls/${call}/delete_user/`, {
    user,
    role,
  });

export const updateCallUser = ({ call, user, role, expiration_time }) =>
  post(`/proposal-protected-calls/${call}/update_user/`, {
    user,
    role,
    expiration_time,
  });
