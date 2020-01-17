import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { userUpdated } from '@waldur/workspace/actions';

export const UserEmailChangeDialog = ({ resolve: {user} }) => {
  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();

  const handleSubmit = React.useCallback(async () => {
    setSubmitting(false);
    try {
      await post(`/users/${user.uuid}/change_email/`,  {email});
    } catch (error) {
      const errorMessage = `${translate('Unable to change email.')} ${format(error)}`;
      dispatch(showError(errorMessage));
      return;
    }
    dispatch(showSuccess(translate('Email verification has been sent. Please check your inbox.')));
    dispatch(closeModalDialog());
    dispatch(userUpdated({...user, requested_email: email}));
  }, [email]);

  const handleClose = React.useCallback(() => {
    dispatch(closeModalDialog());
  }, []);

  return (
    <ModalDialog
      title={translate('Change user email')}
      footer={
        <>
          <Button
            bsStyle="primary"
            onClick={handleSubmit}
            disabled={email === user.email || !email || submitting}>
            {submitting && <><i className="fa fa-spinner fa-spin"/>{' '}</>}
            {translate('Submit')}
          </Button>
          <Button
            onClick={handleClose}
            disabled={submitting}>
            {translate('Cancel')}
          </Button>
        </>
      }
    >
      <p>
        <strong>{translate('Current email')}</strong>: {user.email}
      </p>
      <p>
        <strong>{translate('New email')}</strong>:
      </p>
      <input
        type="email"
        className="form-control"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
    </ModalDialog>
  );
};

export default connectAngularComponent(UserEmailChangeDialog, ['resolve']);
