import { useEffect, FunctionComponent } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const CustomerErrorDialog: FunctionComponent<{ resolve }> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (ENV.plugins.WALDUR_SUPPORT) {
      dispatch(closeModalDialog());
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Incorrect organization details'),
            customer: resolve.customer,
          },
        }),
      );
    }
  }, [dispatch, resolve]);
  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Incorrect organization details')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ENV.plugins.WALDUR_CORE.SITE_EMAIL
          ? translate(
              'To correct details of your organization, please send an email to {supportEmail} highlighting the errors in current details. Thank you!',
              {
                supportEmail: (
                  <a href={`mailto:${ENV.plugins.WALDUR_CORE.SITE_EMAIL}`}>
                    {ENV.plugins.WALDUR_CORE.SITE_EMAIL}
                  </a>
                ),
              },
              formatJsxTemplate,
            )
          : null}
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
