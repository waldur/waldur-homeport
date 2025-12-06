import {
  IssueRequest,
  supportAttachmentsCreate,
  supportIssuesCreate,
} from 'waldur-js-client';

import { formDataOptions } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { router } from '@waldur/router';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

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
    router.stateService.go('support-detail', { uuid: issue.uuid });
    dispatch(closeModalDialog());
  } catch (e) {
    dispatch(showErrorResponse(e, translate('Unable to create request.')));
    if (refetch) refetch();
  }
};
