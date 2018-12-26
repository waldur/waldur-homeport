import { post } from '@waldur/core/api';
import { $http, ENV } from '@waldur/core/services';

export const updateUser = user =>
  $http
    .patch(`${ENV.apiEndpoint}api/users/${user.uuid}/`, {
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
    post(`/users/${userUuid}/activate/`);

export const deactivateUser = userUuid =>
  post(`/users/${userUuid}/deactivate/`);
