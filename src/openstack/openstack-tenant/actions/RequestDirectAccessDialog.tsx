import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { IssueCreateDialog } from '@waldur/issues/create/IssueCreateDialog';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

export const RequestDirectAccessDialog = ({ resolve: { resource }, close }) => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (isFeatureVisible('support')) {
      close();
      dispatch(
        openModalDialog(IssueCreateDialog, {
          resolve: {
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
