import { Modal } from 'react-bootstrap';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { useSaml2 } from './hooks';
import { ProviderField } from './ProviderField';

export const AuthSaml2Dialog = reduxForm({
  form: 'authSaml2Search',
})(({ handleSubmit, invalid, submitting, pristine }) => {
  const handleSaml2Login = useSaml2();
  return (
    <form
      onSubmit={handleSubmit((formData: { provider: { url } }) =>
        handleSaml2Login(formData.provider.url),
      )}
    >
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
