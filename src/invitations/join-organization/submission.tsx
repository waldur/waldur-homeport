import { CheckCircleIcon, InfoIcon, XCircleIcon } from '@phosphor-icons/react';
import {
  GroupInvitation,
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { FieldErrorMessage } from '@/form/FieldError';
import { formatJsxTemplate, translate } from '@/i18n';
import { ModalService } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { UsersService } from '@/user/UsersService';

import { ProjectDetailsDialog } from './ProjectDetailsDialog';

const isDuplicateOrConflictError = (errorMessage: unknown): boolean =>
  typeof errorMessage === 'string' &&
  (errorMessage.includes('already exists') ||
    errorMessage.includes('already has'));

const submitRequest = (
  groupInvitationUuid: string,
  _dispatch,
  body?: { project_name?: string; project_description?: string },
) =>
  userGroupInvitationsSubmitRequest({
    path: { uuid: groupInvitationUuid },
    body: body || {},
  })
    .then((res) => res.data)
    .then(async (groupInvitation) => {
      GroupInvitationTokenStorage.remove();
      if (groupInvitation.auto_approved) {
        await UsersService.refreshCurrentUser();
        await ModalService.confirm(
          translate('You have successfully joined {organization}', {
            organization: renderFieldOrDash(groupInvitation.scope_name),
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
        await ModalService.confirm(
          translate('Request has been sent for approval'),
          translate(
            "Your request to join the organization {name} has been submitted. You'll receive a notification once it's reviewed and approved.",
            {
              name: (
                <strong>{renderFieldOrDash(groupInvitation.scope_name)}</strong>
              ),
            },
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
      const errorMessage = format(err);
      if (isDuplicateOrConflictError(errorMessage)) {
        await ModalService.confirm(
          translate('You already have access'),
          translate(
            'You already have the requested role or a pending request for this organization.',
          ),
          {
            type: 'primary',
            size: 'sm',
            positiveButton: translate('OK'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'primary w-95px',
            iconNode: <InfoIcon weight="bold" />,
          },
        );
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

        await ModalService.confirm(
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

export const requestToAccessOrganization = async (
  invitationOrUuid: GroupInvitation | string,
  dispatch,
) => {
  let invitation: GroupInvitation;
  if (typeof invitationOrUuid === 'string') {
    const res = await userGroupInvitationsRetrieve({
      path: { uuid: invitationOrUuid },
    });
    invitation = res.data;
  } else {
    invitation = invitationOrUuid;
  }

  if (invitation.allow_custom_project_details) {
    return new Promise<void>((resolve) => {
      ModalService.open(ProjectDetailsDialog, {
        resolve: {
          onSubmit: (data) => {
            submitRequest(invitation.uuid, dispatch, data).then(() =>
              resolve(),
            );
          },
          onCancel: () => {
            GroupInvitationTokenStorage.remove();
            resolve();
          },
        },
        size: 'md',
      });
    });
  }
  return submitRequest(invitation.uuid, dispatch);
};
