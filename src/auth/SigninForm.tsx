import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { ENV } from '@waldur/core/config';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import * as AuthService from './AuthService';
import { InputGroup } from './InputGroup';

interface FormData {
  signin_by: 'username' | 'token';
  username: string;
  password: string;
  token: string;
}

const signin = async (values: FormData) => {
  // See also: https://github.com/facebook/react/issues/1159#issuecomment-506584346
  if (
    values.signin_by === 'username' &&
    (!values.password || !values.username)
  ) {
    return translate('Please enter username and password.');
  }
  if (values.signin_by === 'token' && !values.token) {
    return translate('Please enter  access token.');
  }
  try {
    if (values.signin_by === 'username') {
      await AuthService.signin(values.username, values.password);
    } else {
      await AuthService.signinByToken(values.token);
    }
    await AuthService.redirectOnSuccess();
  } catch (error) {
    let renderedError;
    try {
      // Check multiple possible error structures
      if (error?.response?.data?.detail) {
        renderedError = error.response.data.detail;
      } else if (error?.data?.detail) {
        renderedError = error.data.detail;
      } else if (error?.detail) {
        renderedError = error.detail;
      } else if (error?.message) {
        renderedError = error.message;
      } else {
        const formatted = format(error);
        renderedError =
          typeof formatted === 'string'
            ? formatted
            : formatted?.message || translate('Unknown error');
      }
    } catch {
      renderedError = translate('Unknown error');
    }
    return { _error: renderedError };
  }
};

const initialValues = { signin_by: 'username' };

export const SigninForm = () => (
  <Form
    onSubmit={signin}
    initialValues={initialValues}
    render={({
      handleSubmit,
      submitting,
      submitError,
      submitErrors,
      values,
    }) => {
      const formError = submitErrors?._error || submitError;
      return (
        <form className="mb-2" onSubmit={handleSubmit}>
          <Field
            name="signin_by"
            render={({ input }) => (
              <ToggleButtonGroup {...input} type="radio" className="w-100 mb-5">
                <ToggleButton
                  id="tbg-username"
                  value="username"
                  variant="tertiary"
                  className="w-50"
                >
                  {translate('Username')}
                </ToggleButton>
                <ToggleButton
                  id="tbg-token"
                  value="token"
                  variant="tertiary"
                  className="w-50"
                >
                  {translate('Access token')}
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />

          {values.signin_by === 'username' ? (
            <>
              <FormGroup
                label={translate('Username')}
                className="text-start"
                spaceless
              >
                <InputGroup
                  fieldName="username"
                  placeholder={translate('Enter your username')}
                  type="text"
                />
              </FormGroup>
              <FormGroup
                label={translate('Password')}
                className="text-start"
                space={8}
              >
                <InputGroup
                  fieldName="password"
                  placeholder={translate('Enter your password')}
                  type="password"
                />
              </FormGroup>
            </>
          ) : (
            <FormGroup
              label={translate('Access token')}
              description={translate(
                'Use a personal access token issued by {siteName}',
                { siteName: ENV.plugins.WALDUR_CORE.SITE_NAME },
              )}
              className="text-start"
              space={8}
            >
              <InputGroup
                fieldName="token"
                placeholder={translate('Paste here your token')}
                type="password"
              />
            </FormGroup>
          )}

          <SubmitButton
            submitting={submitting}
            label={translate('Login')}
            className="login-submit-button"
          />

          {formError && (
            <div
              className="alert alert-danger mt-3 ellipsis-lines-1"
              role="alert"
              style={{ maxWidth: '100vh' }}
            >
              {formError}
            </div>
          )}
        </form>
      );
    }}
  />
);
