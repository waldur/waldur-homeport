import { Form } from 'react-final-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import * as AuthService from './AuthService';
import { InputGroup } from './InputGroup';

interface FormData {
  username: string;
  password: string;
}

const signin = async (values: FormData) => {
  // See also: https://github.com/facebook/react/issues/1159#issuecomment-506584346
  if (!values.password || !values.username) {
    return translate('Please enter username and password.');
  }
  try {
    await AuthService.signin(values.username, values.password);
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

export const SigninForm = () => (
  <Form
    onSubmit={signin}
    render={({ handleSubmit, submitting, submitError, submitErrors }) => {
      const formError = submitErrors?._error || submitError;
      return (
        <form className="mb-2" onSubmit={handleSubmit}>
          <InputGroup
            fieldName="username"
            placeholder={translate('Username')}
            type="text"
          />

          <InputGroup
            fieldName="password"
            placeholder={translate('Password')}
            type="password"
          />

          <button
            type="submit"
            className="btn btn-primary login-submit-button"
            disabled={submitting}
          >
            {submitting && (
              <span className="svg-icon">
                <LoadingSpinnerIcon className="me-1" />
              </span>
            )}
            {translate('Login')}
          </button>

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
