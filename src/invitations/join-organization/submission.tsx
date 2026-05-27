import { CheckCircleIcon, XCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import {
  GroupInvitation,
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { FieldErrorMessage } from '@/form/FieldError';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { renderFieldOrDash } from '@/table/utils';
import { UsersService } from '@/user/UsersService';

import {
  getDuplicateErrorDialogOptions,
  isDuplicateOrConflictError,
} from '../utils';

import { ProjectDetailsDialog } from './ProjectDetailsDialog';

export const useRequestToAccessOrganization = () => {
  const { openDialog, confirm } = useModal();

  const submitRequest = useCallback(
    async (
      groupInvitationUuid: string,
      body?: { project_name?: string; project_description?: string },
    ) => {
      try {
        const res = await userGroupInvitationsSubmitRequest({
          path: { uuid: groupInvitationUuid },
          body: body || {},
        });
        const groupInvitation = res.data;
        GroupInvitationTokenStorage.remove();

        if (groupInvitation.auto_approved) {
          await UsersService.refreshCurrentUser();
          await confirm(
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
          await confirm(
            translate('Request has been sent for approval'),
            translate(
              "Your request to join the organization {name} has been submitted. You'll receive a notification once it's reviewed and approved.",
              {
                name: (
                  <strong>
                    {renderFieldOrDash(groupInvitation.scope_name)}
                  </strong>
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
      } catch (err) {
        GroupInvitationTokenStorage.remove();
        const errorMessage = format(err);
        if (isDuplicateOrConflictError(errorMessage)) {
          const dialog = getDuplicateErrorDialogOptions();
          await confirm(dialog.title, dialog.message, dialog.options);
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

          await confirm(translate('Access restricted'), formattedMessage, {
            type: 'danger',
            size: 'sm',
            positiveButton: translate('Cancel request'),
            onlyPositiveButton: true,
            positiveButtonVariant: 'danger',
            iconNode: <XCircleIcon weight="bold" />,
          });
        }
      }
    },
    [confirm],
  );

  const request = useCallback(
    async (invitationOrUuid: GroupInvitation | string) => {
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
          openDialog(ProjectDetailsDialog, {
            resolve: {
              onSubmit: (data) => {
                submitRequest(invitation.uuid, data).then(() => resolve());
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
      return submitRequest(invitation.uuid);
    },
    [openDialog, submitRequest],
  );

  const checkAndRequest = useCallback(async () => {
    const groupToken = GroupInvitationTokenStorage.get();
    if (groupToken) {
      const user = await UsersService.getCurrentUser();
      const hasAcceptedTos =
        user?.is_staff || user?.is_support || Boolean(user?.agreement_date);

      if (hasAcceptedTos) {
        return request(groupToken);
      }
    }
  }, [request]);

  return { request, checkAndRequest };
};
