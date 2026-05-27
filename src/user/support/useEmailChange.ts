import { useState } from 'react';
import { usersCancelChangeEmail, usersChangeEmail } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useSetUser } from '@/workspace/hooks';

export const useEmailChange = (user) => {
  const [email, setEmail] = useState('');
  const setCurrentUser = useSetUser();

  const changeEmailMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      usersChangeEmail({ path: { uuid: user.uuid }, body: { email } }),
    onSuccess: () => {
      setCurrentUser({ ...user, requested_email: email });
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
      setCurrentUser({ ...user, requested_email: null });
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
