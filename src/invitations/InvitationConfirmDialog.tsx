import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect } from 'react';
import { userInvitationsDetailsRetrieve } from 'waldur-js-client';

import { getInvitationLinkProps } from '@/administration/getInvitationLinkProps';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { InvitationTokenStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useUser } from '@/workspace/hooks';

import { formatInvitationState } from './choices';
import { InvitationButtons } from './InvitationButtons';
import { InvitationErrorMessage } from './InvitationErrorMessage';
import { InvitationMessage } from './InvitationMessage';

export const InvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const router = useRouter();

  const user = useUser();
  const asyncResult = useQuery({
    queryKey: ['invitation', token],

    queryFn: () =>
      userInvitationsDetailsRetrieve({ path: { uuid: token } }).then(
        (response) => response.data,
      ),
  });
  const invitation = asyncResult.data;

  const { closeDialog } = useModal();

  const dismiss = useCallback(() => {
    deferred.reject();
    closeDialog();
  }, [closeDialog, deferred]);

  const closeAcceptingInvitation = useCallback(() => {
    closeDialog();
    deferred.resolve({ invitation });
  }, [closeDialog, deferred, invitation]);

  const closeButton = useCallback(() => {
    closeDialog();
    router.stateService.go('profile.details');
  }, [closeDialog]);

  useEffect(() => {
    if (invitation?.state === 'accepted') {
      const linkProps = getInvitationLinkProps(invitation);
      if (linkProps) {
        router.stateService.go(linkProps.state, linkProps.params);
      }
      InvitationTokenStorage.remove();
      closeDialog();
    }
  }, [invitation]);

  return (
    <ModalDialog
      title={translate('Invitation confirmation')}
      footer={
        !user ? null : invitation?.state === 'pending' ? (
          <InvitationButtons
            dismiss={dismiss}
            closeAcceptingInvitation={closeAcceptingInvitation}
          />
        ) : (
          <CloseDialogButton label={translate('Close')} onClick={closeButton} />
        )
      }
    >
      {!user ? null : asyncResult.isLoading ? (
        <>
          <LoadingSpinner />
          <p className="text-center">
            {translate('Please give us a moment to validate your invitation.')}
          </p>
        </>
      ) : asyncResult.isError ? (
        <InvitationErrorMessage dismiss={dismiss} />
      ) : invitation?.state === 'pending' ? (
        <InvitationMessage invitation={invitation} user={user} />
      ) : invitation?.state ? (
        translate('Invitation is in {state} state.', {
          state: formatInvitationState(invitation.state),
        })
      ) : null}
    </ModalDialog>
  );
};
