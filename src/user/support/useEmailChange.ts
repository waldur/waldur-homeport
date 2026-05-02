import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { usersCancelChangeEmail, usersChangeEmail } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentUser } from '@/workspace/actions';

export const useEmailChange = (user) => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const changeEmailMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      usersChangeEmail({ path: { uuid: user.uuid }, body: { email } }),
    onSuccess: () => {
      dispatch(setCurrentUser({ ...user, requested_email: email }));
    },
    successMessage: translate(
      'Email verification has been sent. Please check your inbox.',
    ),
    errorMessage: translate('Unable to change email.'),
  });

  const cancelRequestMutation = useManagedMutation<any, any, void>({
    mutationFn: () => usersCancelChangeEmail({ path: { uuid: user.uuid } }),
    successMessage: translate('Email change request has been cancelled.'),
    onSuccess: () => {
      dispatch(setCurrentUser({ ...user, requested_email: null }));
    },
    errorMessage: translate('Unable to cancel request.'),
  });

  const submitting =
    changeEmailMutation.isPending || cancelRequestMutation.isPending;

  return {
    handleSubmit: changeEmailMutation.mutateAsync,
    cancelRequest: cancelRequestMutation.mutateAsync,
    submitting,
    email,
    setEmail,
  };
};
