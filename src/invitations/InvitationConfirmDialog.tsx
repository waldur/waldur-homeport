import { useCallback, FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationButtons } from './InvitationButtons';
import { InvitationErrorMessage } from './InvitationErrorMessage';
import { InvitationMessage } from './InvitationMessage';
import { InvitationService } from './InvitationService';

export const InvitationConfirmDialog: FunctionComponent<{
  resolve: { token; deferred };
}> = ({ resolve: { token, deferred } }) => {
  const dispatch = useDispatch();

  const close = useCallback(() => dispatch(closeModalDialog()), [dispatch]);

  const dismiss = useCallback(() => {
    deferred.reject();
    close();
  }, [close, deferred]);

  const closeAcceptingNewEmail = useCallback(() => {
    close();
    deferred.resolve(true);
  }, [close, deferred]);

  const closeDecliningNewEmail = useCallback(() => {
    close();
    deferred.resolve(false);
  }, [close, deferred]);

  const user = useSelector(getUser);
  const asyncResult = useAsync(() =>
    InvitationService.details(token).then((response) => response.data),
  );
  const invitation = asyncResult.value;

  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('Invitation confirmation')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {!user ? null : asyncResult.loading ? (
          <>
            <LoadingSpinner />
            <p className="text-center">
              {translate(
                'Please give us a moment to validate your invitation.',
              )}
            </p>
          </>
        ) : asyncResult.error ? (
          <InvitationErrorMessage dismiss={dismiss} />
        ) : asyncResult.value ? (
          <InvitationMessage invitation={invitation} user={user} />
        ) : null}
      </ModalBody>
      <ModalFooter>
        {asyncResult.value ? (
          <InvitationButtons
            user={user}
            invitation={invitation}
            dismiss={dismiss}
            closeAcceptingNewEmail={closeAcceptingNewEmail}
            closeDecliningNewEmail={closeDecliningNewEmail}
          />
        ) : null}
      </ModalFooter>
    </>
  );
};
