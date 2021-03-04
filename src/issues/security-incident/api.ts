import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';
import { putAttachment } from '@waldur/issues/attachments/api';
import { formatDescriptionField } from '@waldur/issues/security-incident/utils';
import { ISSUE_IDS } from '@waldur/issues/types/constants';

export const reportSecurityIncident = (formData) => {
  const reqData = {
    summary: formData.summary,
    date: undefined,
    type: ISSUE_IDS.INCIDENT,
    description: formatDescriptionField(
      formData.description,
      formData.date,
      formData.type.value,
    ),
    project: formData.project?.url,
    resource: formData.resource?.url,
    is_reported_manually: true,
  };
  return sendForm('POST', `${ENV.apiEndpoint}api/support-issues/`, reqData);
};

export const uploadAttachments = (issueUrl: string, files: FileList) =>
  Promise.all(
    Array.from(files).map((file: File) => putAttachment(issueUrl, file)),
  );
