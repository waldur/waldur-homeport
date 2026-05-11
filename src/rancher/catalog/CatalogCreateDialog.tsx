import { FC } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { rancherCatalogsCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  StringField,
  TextField,
  SecretField,
  FormContainerFinal,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Resource } from '@/resource/types';
import { createEntity } from '@/table/actions';

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
  const dispatch = useDispatch();

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
    onSuccess: (response: any) => {
      const catalog = response.data;
      dispatch(createEntity('rancher-catalogs', catalog.uuid, catalog));
    },
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
            <FormContainerFinal submitting={createCatalogMutation.isPending}>
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
            </FormContainerFinal>
          </ModalDialog>
        </form>
      )}
    />
  );
};
