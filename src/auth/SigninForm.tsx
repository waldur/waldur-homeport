import { reduxForm, SubmissionError } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';

import { AuthService } from './AuthService';
import { InputGroup } from './InputGroup';

interface FormData {
  username: string;
  password: string;
}

const signin = async (values: FormData) => {
  // See also: https://github.com/facebook/react/issues/1159#issuecomment-506584346
  if (!values.password || !values.username) {
    throw new SubmissionError({
      _error: translate('Please enter username and password.'),
    });
  }
  try {
    await AuthService.signin(values.username, values.password);
    await AuthService.redirectOnSuccess();
  } catch (error) {
    throw new SubmissionError({ _error: format(error.response) });
  }
};

const FORM_ID = 'SigninForm';

export const SigninForm = reduxForm<FormData>({ form: FORM_ID })(
  ({ submitting, handleSubmit, error }) => (
    <form className="mb-2" onSubmit={handleSubmit(signin)}>
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
        className="LoginSubmitButton"
        style={{
          backgroundColor: ENV.plugins.WALDUR_CORE.BRAND_COLOR,
        }}
        disabled={submitting}
      >
        {submitting && (
          <>
            <i className="fa fa-spinner fa-spin me-1" />{' '}
          </>
        )}
        {translate('Login')}
      </button>
      {error && <p className="text-danger">{JSON.stringify(error)}</p>}
    </form>
  ),
);
