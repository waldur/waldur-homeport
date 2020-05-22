import * as React from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { StringField, TextField, SecretField } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { Resource } from '@waldur/resource/types';
import { connectAngularComponent } from '@waldur/store/connect';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { createEntity } from '@waldur/table-react/actions';

import { createCatalog } from '../api';

interface FormData {
  name: string;
  description: string;
  catalog_url: string;
  branch: string;
  username?: string;
  password?: string;
}

interface OwnProps {
  resolve: {
    cluster: Resource;
  };
}

const useCatalogCreateDialog = cluster => {
  const [submitting, setSubmitting] = React.useState(false);
  const dispatch = useDispatch();
  const callback = React.useCallback(
    async formData => {
      try {
        setSubmitting(true);
        const response = await createCatalog({
          scope: cluster.url,
          ...formData,
        });
        const catalog = response.data;
        dispatch(createEntity('rancher-catalogs', catalog.uuid, catalog));
      } catch (error) {
        const errorMessage = `${translate(
          'Unable to create catalog.',
        )} ${format(error)}`;
        dispatch(showError(errorMessage));
        setSubmitting(false);
        return;
      }
      dispatch(showSuccess(translate('Catalog has been created.')));
      dispatch(closeModalDialog());
    },
    [dispatch, cluster],
  );
  return {
    submitting,
    createCatalog: callback,
  };
};

export const CatalogCreateDialog = reduxForm<FormData, OwnProps>({
  form: 'RancherCatalogCreate',
})(props => {
  const { submitting, createCatalog } = useCatalogCreateDialog(
    props.resolve.cluster,
  );
  return (
    <ActionDialog
      title={translate('Create catalog')}
      submitLabel={translate('Submit')}
      onSubmit={props.handleSubmit(createCatalog)}
      submitting={submitting}
    >
      <StringField name="name" label={translate('Name')} required={true} />
      <TextField name="description" label={translate('Description')} />
      <StringField
        name="catalog_url"
        label={translate('Catalog URL')}
        required={true}
      />
      <StringField name="branch" label={translate('Branch')} required={true} />
      <StringField name="username" label={translate('Username')} />
      <SecretField name="password" label={translate('Password')} />
    </ActionDialog>
  );
});

export default connectAngularComponent(CatalogCreateDialog, ['resolve']);
