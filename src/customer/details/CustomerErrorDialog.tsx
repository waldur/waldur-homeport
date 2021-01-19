import { useEffect, FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
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
    if (isFeatureVisible('support') || !ENV.supportEmail) {
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
      <ModalHeader>
        <ModalTitle>{translate('Incorrect organization details')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {ENV.supportEmail
          ? translate(
              'To correct details of your organization, please send an email to {supportEmail} highlighting the errors in current details. Thank you!',
              {
                supportEmail: (
                  <a href={`mailto:${ENV.supportEmail}`}>{ENV.supportEmail}</a>
                ),
              },
              formatJsxTemplate,
            )
          : null}
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
