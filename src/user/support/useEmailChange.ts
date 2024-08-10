import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { setCurrentUser } from '@waldur/workspace/actions';

export const useEmailChange = (user) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = useCallback(async () => {
    setSubmitting(false);
    try {
      await post(`/users/${user.uuid}/change_email/`, { email });
    } catch (error) {
      const errorMessage = `${translate('Unable to change email.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    dispatch(
      showSuccess(
        translate('Email verification has been sent. Please check your inbox.'),
      ),
    );
    dispatch(closeModalDialog());
    dispatch(setCurrentUser({ ...user, requested_email: email }));
  }, [user, email, dispatch]);

  const cancelRequest = useCallback(async () => {
    try {
      setSubmitting(true);
      await post(`/users/${user.uuid}/cancel_change_email/`, { user });
      dispatch(setCurrentUser({ ...user, requested_email: null }));
    } catch (error) {
      setSubmitting(false);
      const errorMessage = `${translate('Unable to cancel request.')} ${format(
        error,
      )}`;
      dispatch(showError(errorMessage));
      return;
    }
    setSubmitting(false);
    dispatch(
      showSuccess(translate('Email change request has been cancelled.')),
    );
    dispatch(closeModalDialog());
  }, [user, setSubmitting, dispatch]);

  return { handleSubmit, cancelRequest, submitting, email, setEmail };
};
