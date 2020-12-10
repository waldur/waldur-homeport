import { useState, useEffect } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { IssueCreateDialog } from '@waldur/issues/create/IssueCreateDialog';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog, closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const CustomerErrorDialog = ({ resolve }) => {
  const [message, setMessage] = useState<string>();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFeatureVisible('support')) {
      dispatch(closeModalDialog());
      dispatch(
        openModalDialog(IssueCreateDialog, {
          resolve: {
            issue: {
              type: ISSUE_IDS.SERVICE_REQUEST,
              summary: translate('Incorrect organization details'),
              customer: resolve.customer,
            },
          },
        }),
      );
    } else {
      const context = { supportEmail: ENV.supportEmail };
      setMessage(
        translate(
          'To correct details of your organization, please send an email to <a href="mailto:{supportEmail}">{supportEmail}</a> highlighting the errors in current details. Thank you!',
          context,
        ),
      );
    }
  }, [dispatch, resolve]);
  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('Incorrect organization details')}</ModalTitle>
      </ModalHeader>
      <ModalBody>{message && <FormattedHtml html={message} />}</ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
