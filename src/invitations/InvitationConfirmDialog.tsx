import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FunctionComponent, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userInvitationsDetailsRetrieve } from 'waldur-js-client';

import { getInvitationLinkProps } from '@waldur/administration/getInvitationLinkProps';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationButtons } from './InvitationButtons';
import { InvitationErrorMessage } from './InvitationErrorMessage';
import { InvitationMessage } from './InvitationMessage';
import { formatInvitationState } from './InvitationStateFilter';
import { clearInvitationToken } from './InvitationStorage';

export const InvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const router = useRouter();

  const user = useSelector(getUser);
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

  useEffect(() => {
    if (invitation?.state === 'accepted') {
      const linkProps = getInvitationLinkProps(invitation);
      if (linkProps) {
        router.stateService.go(linkProps.state, linkProps.params);
      }
      clearInvitationToken();
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
        ) : null
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
