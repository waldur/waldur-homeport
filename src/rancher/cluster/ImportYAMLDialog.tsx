import * as React from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

import { importYAML } from '../api';

export const ImportYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { cluster_id } }
>({ form: 'ImportYAMLDialog' })(({ resolve, handleSubmit, submitting }) => {
  const dispatch = useDispatch();

  const handler = React.useCallback(
    async (formData) => {
      try {
        await importYAML(resolve.cluster_id, formData.yaml);
        dispatch(showSuccess(translate('YAML has been imported.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to import YAML.')));
      }
    },
    [dispatch, resolve.cluster_id],
  );

  return (
    <ActionDialog
      title={translate('Import YAML')}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit(handler)}
      submitting={submitting}
    >
      <MonacoField name="yaml" mode="yaml" height={200} />
    </ActionDialog>
  );
});
