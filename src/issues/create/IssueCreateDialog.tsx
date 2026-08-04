import { FunctionComponent } from 'react';
import {
  Issue,
  IssueRequest,
  supportAttachmentsCreate,
  supportIssuesCreate,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { router } from '@/router';
import { useNotify } from '@/store/notify';

import { IssueCreateButtonProps } from '../list/IssueCreateButton';
import { ISSUE_IDS } from '../types/constants';

import { IssueCreateForm } from './IssueCreateForm';
import { IssueFormData } from './types';

interface CreateIssueDialogProps {
  resolve: IssueCreateButtonProps;
}

export const constructIssuePayload = (
  formData: IssueFormData,
): IssueRequest => {
  const payload: IssueRequest = {
    type: formData.type
      ? typeof formData.type === 'string'
        ? formData.type
        : formData.type.id
      : ISSUE_IDS.INFORMATIONAL,
    summary: formData.summary,
    description: formData.description,
    is_reported_manually: true,
    template: formData.issueTemplate?.url,
  };

  if (formData.resource) {
    payload.resource = formData.resource.url;
  } else if (formData.project) {
    payload.project = formData.project.url;
  } else if (formData.customer) {
    payload.customer = formData.customer.url;
  }

  // Independent of the scope above: routes the request to the offering's
  // provider helpdesk (backend resolves offering -> provider).
  if (formData.offering) {
    payload.offering = formData.offering;
  }

  return payload;
};

const uploadAttachments = async (issueUrl: string, files?: FileList) => {
  if (!files || files.length === 0) return;
  await Promise.all(
    Array.from(files).map((file) =>
      supportAttachmentsCreate({
        body: { issue: issueUrl, file },
        ...formDataOptions,
      }),
    ),
  );
};

export const IssueCreateDialog: FunctionComponent<CreateIssueDialogProps> = ({
  resolve,
}) => {
  const { showSuccess } = useNotify();

  const { mutateAsync: createIssue, isPending: submitting } =
    useManagedMutation<Issue, any, IssueFormData>({
      mutationFn: async (formData) => {
        const payload = constructIssuePayload(formData);
        const response = await supportIssuesCreate({ body: payload });
        const issue = response.data;
        await uploadAttachments(issue.url, formData.files);
        return issue;
      },
      onSuccess: (issue) => {
        showSuccess(
          translate('Request {requestId} has been created.', {
            requestId: issue.key,
          }),
        );
        router.stateService.go('support.detail', { issue_uuid: issue.uuid });
      },
      refetch: resolve.refetch,
      errorMessage: translate('Unable to create request.'),
    });

  return (
    <IssueCreateForm
      onCreateIssue={createIssue}
      resolve={resolve}
      submitting={submitting}
    />
  );
};
