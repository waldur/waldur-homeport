import { patch, post } from '@waldur/core/api';

export const updateUser = (user) =>
  patch(`/users/${user.uuid}/`, {
    full_name: user.first_name + ' ' + user.last_name,
    native_name: user.native_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    organization: user.organization,
    job_title: user.job_title,
    description: user.description,
    phone_number: user.phone_number,
    agree_with_policy: user.agree_with_policy,
    token_lifetime: user.token_lifetime.value,
  });

export const activateUser = (userUuid) =>
  patch(`/users/${userUuid}/`, { is_active: true });

export const deactivateUser = (userUuid) =>
  patch(`/users/${userUuid}/`, { is_active: false });

export const addRemoteUser = (cuid) => post('/remote-eduteams/', { cuid });
