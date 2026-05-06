import { Form } from 'react-final-form';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { useSaml2 } from './hooks';
import { ProviderField } from './ProviderField';

export const AuthSaml2Dialog = () => {
  const handleSaml2Login = useSaml2();

  return (
    <Form
      onSubmit={(formData: { provider: { url: string } }) =>
        handleSaml2Login(formData.provider.url)
      }
      render={({ handleSubmit, invalid, submitting, pristine }) => (
        <form onSubmit={handleSubmit}>
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
      )}
    />
  );
};
