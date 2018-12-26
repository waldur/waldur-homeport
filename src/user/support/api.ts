import { patch } from '@waldur/core/api';

export const updateUser = user =>
  patch(`/users/${user.uuid}/`, {
    full_name: user.full_name,
    native_name: user.native_name,
    email: user.email,
    organization: user.organization,
    job_title: user.job_title,
    description: user.description,
    phone_number: user.phone_number,
    agree_with_policy: user.agree_with_policy,
    token_lifetime: user.token_lifetime.value,
  });

export const activateUser = userUuid =>
  patch(`/users/${userUuid}/`, {is_active: true});

export const deactivateUser = userUuid =>
  patch(`/users/${userUuid}/`, {is_active: false});
