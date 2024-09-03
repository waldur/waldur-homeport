import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useCallback, FunctionComponent, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { getInvitationLinkProps } from '@waldur/administration/getInvitationLinkProps';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationButtons } from './InvitationButtons';
import { InvitationErrorMessage } from './InvitationErrorMessage';
import { InvitationMessage } from './InvitationMessage';
import { InvitationService } from './InvitationService';
import { formatInvitationState } from './InvitationStateFilter';
import { clearInvitationToken } from './InvitationStorage';

export const InvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector(getUser);
  const asyncResult = useQuery(['invitation', token], () =>
    InvitationService.details(token).then((response) => response.data),
  );
  const invitation = asyncResult.data;

  const close = useCallback(() => dispatch(closeModalDialog()), [dispatch]);

  const dismiss = useCallback(() => {
    deferred.reject();
    close();
  }, [close, deferred]);

  const closeAcceptingNewEmail = useCallback(() => {
    close();
    deferred.resolve({ replaceEmail: true, invitation });
  }, [close, deferred, invitation]);

  const closeDecliningNewEmail = useCallback(() => {
    close();
    deferred.resolve({ replaceEmail: false, invitation });
  }, [close, deferred, invitation]);

  useEffect(() => {
    if (invitation?.state === 'accepted') {
      const linkProps = getInvitationLinkProps(invitation);
      if (linkProps) {
        router.stateService.go(linkProps.state, linkProps.params);
      }
      clearInvitationToken();
      close();
    }
  }, [invitation]);

  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Invitation confirmation')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!user ? null : asyncResult.isLoading ? (
          <>
            <LoadingSpinner />
            <p className="text-center">
              {translate(
                'Please give us a moment to validate your invitation.',
              )}
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
      </Modal.Body>
      <Modal.Footer>
        {!user ? null : invitation?.state === 'pending' ? (
          <InvitationButtons
            user={user}
            invitation={invitation}
            dismiss={dismiss}
            closeAcceptingNewEmail={closeAcceptingNewEmail}
            closeDecliningNewEmail={closeDecliningNewEmail}
          />
        ) : null}
      </Modal.Footer>
    </>
  );
};
