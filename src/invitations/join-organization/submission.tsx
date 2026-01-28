import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { userGroupInvitationsSubmitRequest } from 'waldur-js-client';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { GroupInvitationTokenStorage } from '@waldur/core/StorageManager';
import { FieldErrorMessage } from '@waldur/form/FieldError';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse } from '@waldur/store/notify';
import { UsersService } from '@waldur/user/UsersService';

export const requestToAccessOrganization = (
  groupInvitationUuid: string,
  dispatch,
) =>
  // Call API directly instead of submitGroupRequest() to avoid duplicate toast notification
  userGroupInvitationsSubmitRequest({ path: { uuid: groupInvitationUuid } })
    .then((res) => res.data)
    .then(async (groupInvitation) => {
      GroupInvitationTokenStorage.remove();
      if (groupInvitation.auto_approved) {
        // Refresh user to get updated permissions from backend
        await UsersService.refreshCurrentUser();
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
      // Extract error message from the error object
      const errorMessage = format(err);
      if (
        typeof errorMessage === 'string' &&
        errorMessage.includes('Request has been created already')
      ) {
        dispatch(showErrorResponse(err));
      } else {
        const formattedMessage = (
          <div>
            <p>
              {translate(
                "You can't join this organization with your current account details. Access is limited to certain users as defined by the organization manager.",
              )}
            </p>
            <p className="fw-bolder">{translate('Restriction details')}:</p>
            <FieldErrorMessage error={errorMessage} />
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
