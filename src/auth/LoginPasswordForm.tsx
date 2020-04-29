import * as React from 'react';
import { reduxForm, SubmissionError } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { ngInjector } from '@waldur/core/services';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';
import { SubmitButton } from './SubmitButton';

interface FormData {
  username: string;
  password: string;
}

const signin = async (values: FormData) => {
  const service = ngInjector.get('authService');
  try {
    await service.signin(values.username, values.password);
    await service.redirectOnSuccess();
  } catch (error) {
    throw new SubmissionError({ _error: format(error) });
  }
};

const FORM_ID = 'LoginPassword';

export const LoginPasswordForm = reduxForm<FormData>({ form: FORM_ID })(
  ({ submitting, handleSubmit, error, invalid }) => (
    <form className="m-b-sm" onSubmit={handleSubmit(signin)}>
      <InputGroup
        fieldName="username"
        formName={FORM_ID}
        placeholder={translate('Username')}
        type="text"
        validate={required}
      />
      <InputGroup
        fieldName="password"
        formName={FORM_ID}
        placeholder={translate('Password')}
        type="password"
        validate={required}
      />
      <SubmitButton
        label={translate('Login')}
        submitting={submitting}
        disabled={invalid}
      />
      {error && <p className="text-danger">{error}</p>}
    </form>
  ),
);
