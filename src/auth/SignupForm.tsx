import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm, SubmissionError } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/coreSaga';

import { InputGroup } from './InputGroup';
import { SubmitButton } from './SubmitButton';

interface FormData {
  username: string;
  password: string;
  email: string;
  full_name: string;
}

export const SignupForm = reduxForm<FormData>({ form: 'SignupForm' })(
  ({ submitting, handleSubmit, error, reset }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const signup = React.useCallback(
      async (values: FormData) => {
        const service = ngInjector.get('authService');
        // See also: https://github.com/facebook/react/issues/1159#issuecomment-506584346
        if (!values.password || !values.username || !values.email) {
          throw new SubmissionError({
            _error: translate('Please enter username, password and email.'),
          });
        }
        try {
          await service.signup(values);
          dispatch(
            showSuccess(
              translate(
                'Confirmation mail has been sent. Please check your inbox!',
              ),
            ),
          );
          reset();
          router.stateService.go('login');
        } catch (error) {
          throw new SubmissionError({ _error: format(error) });
        }
      },
      [dispatch, router.stateService, reset],
    );

    return (
      <form className="m-b-sm" onSubmit={handleSubmit(signup)}>
        <InputGroup
          fieldName="username"
          placeholder={translate('Username')}
          type="text"
        />
        <InputGroup
          fieldName="full_name"
          placeholder={translate('Full name')}
          type="text"
        />
        <InputGroup
          fieldName="email"
          placeholder={translate('Email')}
          type="email"
        />
        <InputGroup
          fieldName="password"
          placeholder={translate('Password')}
          type="password"
        />
        <SubmitButton label={translate('Register')} submitting={submitting} />
        {error && <p className="text-danger">{error}</p>}
      </form>
    );
  },
);
