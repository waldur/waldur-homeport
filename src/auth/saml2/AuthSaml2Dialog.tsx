import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import * as api from '@waldur/auth/saml2/api';
import { redirectPost } from '@waldur/auth/saml2/utils';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showError } from '@waldur/store/notify';

import { ProviderField } from './ProviderField';

export const AuthSaml2Dialog = reduxForm({
  form: 'authSaml2Search',
})(({ handleSubmit, invalid, submitting, pristine }) => {
  const dispatch = useDispatch();
  async function handleSaml2Login(provider) {
    try {
      /* We support only 2 SAML2 bindings: HTTP redirect and HTTP POST.
       * If HTTP redirect binding is used, we're redirecting user
       * to the URL specified by url field.
       * If HTTP POST binding is used, we're submitting form with
       * SAMLRequest field to URL specified by url field.
       */
      const { data } = await api.loginSaml2(provider.url);
      if (data.binding === 'redirect') {
        window.location.assign(data.url);
      } else if (data.binding === 'post') {
        redirectPost(data.url, {
          SAMLRequest: data.request,
        });
      }
    } catch (error) {
      let errorMessage;
      if (error.status === 400) {
        errorMessage = error.data.error_message;
      } else {
        errorMessage = `${translate(
          'Unable to login via SAML2 protocol.',
        )} ${format(error)}`;
      }
      dispatch(showError(errorMessage));
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSaml2Login)}>
      <Modal.Header>
        <Modal.Title>
          {translate('Please search for your organization')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ProviderField />
      </Modal.Body>
      <Modal.Footer>
        <button
          disabled={invalid || submitting || pristine}
          type="submit"
          className="btn btn-success"
        >
          {translate('Login')}
        </button>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
});
