import { reduxForm } from 'redux-form';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

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
      <ModalDialog
        title={translate('Please search for your organization')}
        footer={
          <>
            <CloseDialogButton />
            <button
              disabled={invalid || submitting || pristine}
              type="submit"
              className="btn btn-success"
            >
              {translate('Login')}
            </button>
          </>
        }
      >
        <ProviderField />
      </ModalDialog>
    </form>
  );
});
