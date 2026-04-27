import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { rancherCatalogsCreate } from 'waldur-js-client';

import { StringField, TextField, SecretField } from '@/form';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { closeModalDialog } from '@/modal/actions';
import { Resource } from '@/resource/types';
import { showErrorResponse, showSuccess } from '@/store/notify';
import { createEntity } from '@/table/actions';

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

const useCatalogCreateDialog = (cluster) => {
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const callback = useCallback(
    async (formData) => {
      try {
        setSubmitting(true);
        const response = await rancherCatalogsCreate({
          body: {
            scope: cluster.url,
            ...formData,
          },
        });
        const catalog = response.data;
        dispatch(createEntity('rancher-catalogs', catalog.uuid, catalog));
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to create catalog.')),
        );
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
})((props) => {
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
