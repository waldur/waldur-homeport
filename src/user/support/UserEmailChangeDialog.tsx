import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { useEmailChange } from './useEmailChange';

export const UserEmailChangeDialog = ({ resolve: { user } }) => {
  const dispatch = useDispatch();

  const { handleSubmit, submitting, email, setEmail } = useEmailChange(user);

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
            disabled={email === user.email || !email || submitting}
          >
            {submitting && (
              <>
                <i className="fa fa-spinner fa-spin" />{' '}
              </>
            )}
            {translate('Submit')}
          </Button>
          <Button onClick={handleClose} disabled={submitting}>
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
