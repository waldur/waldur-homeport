import { sendForm } from '@waldur/core/api';
import { ENV, $http } from '@waldur/core/services';

export const getAttachments = (issue: string) => {
  return $http.get(`${ENV.apiEndpoint}api/support-attachments/`, {
    params: {
      issue,
    },
  });
};

export const putAttachments = (issueUrl: string, file: File) => {
  return sendForm('POST', `${ENV.apiEndpoint}api/support-attachments/`, {
    issue: issueUrl,
    file,
  });
};

export const deleteAttachments = (uuid: string) => {
  return $http.delete(`${ENV.apiEndpoint}api/support-attachments/{${uuid}}/`);
};
