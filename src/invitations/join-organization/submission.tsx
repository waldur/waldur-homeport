import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';

import { GroupInvitationTokenStorage } from '@waldur/core/StorageManager';
import { FieldErrorMessage } from '@waldur/form/FieldError';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';

import { submitGroupRequest } from '../utils';

export const requestToAccessOrganization = (
  groupInvitationUuid: string,
  dispatch,
) =>
  submitGroupRequest(groupInvitationUuid)
    .then(async (groupInvitation) => {
      GroupInvitationTokenStorage.remove();
      if (groupInvitation.auto_approved) {
        await waitForConfirmation(
          dispatch,
          translate('You have successfully joined {organization}', {
            organization: groupInvitation.scope_name || 'N/A',
          }),
          translate(
            'You can now see the shared resources and collaborate with your team.',
          ),
          {
            type: 'success',
            size: 'sm',
            positiveButton: translate('OK'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'primary w-95px',
            iconNode: <CheckCircleIcon weight="bold" />,
          },
        );
      } else {
        await waitForConfirmation(
          dispatch,
          translate('Request has been sent for approval'),
          translate(
            "Your request to join the organization {name} has been submitted. You’ll receive a notification once it's reviewed and approved.",
            { name: <strong>{groupInvitation.scope_name || 'N/A'}</strong> },
            formatJsxTemplate,
          ),
          {
            type: 'success',
            size: 'sm',
            positiveButton: translate('OK'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'primary w-95px',
            iconNode: <CheckCircleIcon weight="bold" />,
          },
        );
      }
    })
    .catch(async (err) => {
      GroupInvitationTokenStorage.remove();
      if (err?.[0] && err?.[0].includes('Request has been created already')) {
        dispatch(showErrorResponse(err));
      } else {
        const formattedMessage = (
          <div>
            <p>
              {translate(
                'You can’t join this organization with your current account details. Access is limited to certain users as defined by the organization manager.',
              )}
            </p>
            <p className="fw-bolder">{translate('Restriction details')}:</p>
            <FieldErrorMessage error={err} />
          </div>
        );

        await waitForConfirmation(
          dispatch,
          translate('Access restricted'),
          formattedMessage,
          {
            type: 'danger',
            size: 'sm',
            positiveButton: translate('Cancel request'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'danger',
            iconNode: <XCircleIcon weight="bold" />,
          },
        );
      }
    });
