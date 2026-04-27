import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { usersCancelChangeEmail, usersChangeEmail } from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { showError, showSuccess } from '@/store/notify';
import { setCurrentUser } from '@/workspace/actions';

export const useEmailChange = (user) => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleSubmit = useCallback(async () => {
    setSubmitting(false);
    try {
      await usersChangeEmail({ path: { uuid: user.uuid }, body: { email } });
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
      await usersCancelChangeEmail({ path: { uuid: user.uuid } });
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
