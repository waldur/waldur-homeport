import { FC } from 'react';
import { Form } from 'react-final-form';
import { rancherCatalogsCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  StringField,
  TextField,
  SecretField,
  FormContainer,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Resource } from '@/resource/types';

interface FormData {
  name: string;
  description: string;
  catalog_url: string;
  branch: string;
  username?: string;
  password?: string;
}

interface CatalogCreateDialogProps {
  resolve: {
    cluster: Resource;
  };
}

export const CatalogCreateDialog: FC<CatalogCreateDialogProps> = (props) => {
  const createCatalogMutation = useManagedMutation<any, FormData, any>({
    mutationFn: (formData) =>
      rancherCatalogsCreate({
        body: {
          scope: props.resolve.cluster.url,
          ...formData,
        },
      }),
    successMessage: translate('Catalog has been created.'),
    errorMessage: translate('Unable to create catalog.'),
    invalidateQueries: [{ queryKey: ['table', 'rancher-catalogs'] }],
  });

  return (
    <Form<FormData>
      onSubmit={createCatalogMutation.mutateAsync}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create catalog')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={createCatalogMutation.isPending}
                  label={translate('Submit')}
                  disabled={invalid}
                />
              </>
            }
          >
            <FormContainer submitting={createCatalogMutation.isPending}>
              <StringField
                name="name"
                label={translate('Name')}
                required={true}
                validate={required}
              />
              <TextField name="description" label={translate('Description')} />
              <StringField
                name="catalog_url"
                label={translate('Catalog URL')}
                required={true}
                validate={required}
              />

              <StringField
                name="branch"
                label={translate('Branch')}
                required={true}
                validate={required}
              />
              <StringField name="username" label={translate('Username')} />
              <SecretField name="password" label={translate('Password')} />
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
