import { ENV } from '@waldur/configs/default';
import { patch, post, sendForm } from '@waldur/core/api';

export const updateUser = (user) => {
  const data = {
    native_name: user.native_name,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    image: user.image,
    organization: user.organization,
    job_title: user.job_title,
    description: user.description,
    phone_number: user.phone_number,
    agree_with_policy: user.agree_with_policy,
    token_lifetime: user.token_lifetime.value,
  };
  if (!user.image) {
    // If user tries to remove image
    data.image = '';
  } else if (!(user.image instanceof File)) {
    // if user tries to keep the current image we should not send the image key
    data.image = undefined;
  }
  return sendForm('PATCH', `${ENV.apiEndpoint}api/users/${user.uuid}/`, data);
};

export const activateUser = (userUuid) =>
  patch(`/users/${userUuid}/`, { is_active: true });

export const deactivateUser = (userUuid) =>
  patch(`/users/${userUuid}/`, { is_active: false });

export const addRemoteUser = (cuid) => post('/remote-eduteams/', { cuid });
