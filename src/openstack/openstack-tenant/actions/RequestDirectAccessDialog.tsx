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
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const RequestDirectAccessDialog: FunctionComponent<{
  resolve: { resource };
  close;
}> = ({ resolve: { resource }, close }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isFeatureVisible('support')) {
      close();
      dispatch(
        openIssueCreateDialog({
          issue: {
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: translate('Request direct access to OpenStack Tenant'),
            resource,
          },
          options: {
            title: translate('Request direct access to OpenStack Tenant'),
            descriptionPlaceholder: translate('Please provide a reason'),
            descriptionLabel: translate('Description'),
            hideTitle: true,
          },
        }),
      );
    }
  });
  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {translate('Request direct access to {name}', {
            name: resource.name,
          })}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>
          {translate(
            'To get access, please send a request to {supportEmail}.',
            { supportEmail: ENV.supportEmail },
          )}
        </p>
        <p>
          {translate(
            'Please note that request should specify tenant and provide a reason.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
