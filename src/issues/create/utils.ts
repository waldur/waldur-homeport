import {
  IssueRequest,
  Issue,
  supportAttachmentsCreate,
  supportIssuesCreate,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { router } from '@/router';
import { useNotify } from '@/store/notify';

export const useIssueCreateMutation = (refetch?: () => void) => {
  const { showSuccess } = useNotify();
  return useManagedMutation<
    Issue,
    any,
    { payload: IssueRequest; files?: FileList }
  >({
    mutationFn: async ({ payload, files }) => {
      const issue = await supportIssuesCreate({ body: payload }).then(
        (response) => response.data,
      );
      if (files) {
        await Promise.all(
          Array.from(files).map((file) =>
            supportAttachmentsCreate({
              body: { issue: issue.url, file },
              ...formDataOptions,
            }),
          ),
        );
      }
      return issue;
    },
    onSuccess: (issue) => {
      showSuccess(
        translate('Request {requestId} has been created.', {
          requestId: issue.key,
        }),
      );
      if (refetch) refetch();
      router.stateService.go('support.detail', { issue_uuid: issue.uuid });
    },
    errorMessage: translate('Unable to create request.'),
  });
};
