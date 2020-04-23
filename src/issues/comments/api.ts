import Axios from 'axios';

import { sendForm } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';

export const getComments = (issue: string) => {
  return Axios.get(`${ENV.apiEndpoint}api/support-comments/`, {
    params: {
      issue,
    },
  });
};

export const createComment = (description: string, uuid: string) => {
  return sendForm(
    'POST',
    `${ENV.apiEndpoint}api/support-issues/${uuid}/comment/`,
    {
      is_public: true,
      description,
    },
  );
};

export const updateComment = (description: string, uuid: string) => {
  return sendForm('PUT', `${ENV.apiEndpoint}api/support-comments/${uuid}/`, {
    is_public: true,
    description,
  });
};

export const deleteComment = (uuid: string) => {
  return Axios.delete(`${ENV.apiEndpoint}api/support-comments/${uuid}/`);
};
