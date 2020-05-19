import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { putAttachment } from '@waldur/issues/attachments/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, stateGo, showError } from '@waldur/store/coreSaga';

import {
  IssueFormData,
  CreateIssueProps,
  IssueRequestPayload,
  IssueResponse,
} from './types';

export const createIssue = async (
  formData: IssueFormData,
  issue: CreateIssueProps,
  dispatch,
) => {
  const description = issue.additionalDetails
    ? `${formData.description}. \n\nRequest details: ${issue.additionalDetails}`
    : formData.description;

  const payload: IssueRequestPayload = {
    type: formData.type.id,
    summary: formData.summary,
    description,
    is_reported_manually: true,
  };
  if (issue.customer) {
    payload.customer = issue.customer.url;
  }
  if (issue.project) {
    payload.project = issue.project.url;
  }
  if (issue.resource) {
    payload.resource = issue.resource.url;
  }
  if (formData.issueTemplate) {
    payload.template = formData.issueTemplate.url;
  }
  try {
    const response = await post<IssueResponse>('/support-issues/', payload);
    const issue = response.data;
    await Promise.all(
      Array.from(formData.files).map(file => putAttachment(issue.url, file)),
    );
    dispatch(
      showSuccess(
        translate('Request {requestId} has been created.', {
          requestId: issue.key,
        }),
      ),
    );
    dispatch(stateGo('support.detail', { uuid: issue.uuid }));
    dispatch(closeModalDialog());
  } catch (e) {
    dispatch(showError(translate('Unable to create request.')));
  }
};
