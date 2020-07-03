import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch, useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { InvitationService } from './InvitationService';

export const InvitationConfirmDialog = ({ resolve: { token, deferred } }) => {
  const dispatch = useDispatch();

  const close = React.useCallback(() => dispatch(closeModalDialog()), [
    dispatch,
  ]);

  const dismiss = React.useCallback(() => {
    deferred.reject();
    close();
  }, [close, deferred]);

  const closeAcceptingNewEmail = React.useCallback(() => {
    close();
    deferred.resolve(true);
  }, [close, deferred]);

  const closeDecliningNewEmail = React.useCallback(() => {
    close();
    deferred.resolve(false);
  }, [close, deferred]);

  const user = useSelector(getUser);
  const asyncResult = useAsync<{ email?: string }>(() =>
    InvitationService.check(token).then((response) => response.data),
  );
  const invitation = asyncResult.value;

  React.useEffect(() => {
    if (asyncResult.error) {
      dismiss();
    }
  }, [asyncResult.error, dismiss]);

  React.useEffect(() => {
    if (!user || !invitation) {
      return;
    }

    if (!user.email || user.email === invitation.email) {
      closeDecliningNewEmail();
    }

    const validateInvitationEmail =
      ENV.plugins.WALDUR_CORE.VALIDATE_INVITATION_EMAIL;

    if (
      validateInvitationEmail &&
      user.email &&
      user.email !== invitation.email
    ) {
      dismiss();
    }
  }, [user, invitation, closeDecliningNewEmail, dismiss]);

  const invitationChecked = invitation?.email;
  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {invitationChecked
            ? translate('Email update')
            : translate('Invitation check')}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        {user && invitationChecked ? (
          <>
            <p>
              {translate('Your current email is:')}{' '}
              <strong>{user.email}</strong>
            </p>
            <p>
              {translate('Invitation email is:')}{' '}
              <strong>{invitation.email}</strong>
            </p>
            <p>
              {translate(
                'Would you like to update your current email with the one from the invitation?',
              )}
            </p>
          </>
        ) : (
          <>
            <p>
              <LoadingSpinner />
            </p>
            <p className="text-center">
              {translate(
                'Please give us a moment to validate your invitation.',
              )}
            </p>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        {invitationChecked ? (
          <>
            <Button bsStyle="primary" onClick={closeAcceptingNewEmail}>
              {translate('Yes, use invitation email')}
            </Button>
            <Button onClick={closeDecliningNewEmail}>
              {translate('No, continue using current email')}
            </Button>
          </>
        ) : (
          <Button onClick={dismiss}>{translate('Cancel invitation')}</Button>
        )}
      </ModalFooter>
    </>
  );
};
