import {
  IssueRequest,
  supportAttachmentsCreate,
  supportIssuesCreate,
} from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { router } from '@/router';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const sendIssueCreateRequest = async (
  payload: IssueRequest,
  dispatch,
  refetch?,
  files?: FileList,
) => {
  try {
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
    dispatch(
      showSuccess(
        translate('Request {requestId} has been created.', {
          requestId: issue.key,
        }),
      ),
    );
    if (refetch) refetch();
    router.stateService.go('support.detail', { issue_uuid: issue.uuid });
    dispatch(closeModalDialog());
  } catch (e) {
    dispatch(showErrorResponse(e, translate('Unable to create request.')));
    if (refetch) refetch();
  }
};
