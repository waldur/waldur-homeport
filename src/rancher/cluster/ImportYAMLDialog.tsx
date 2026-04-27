import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { rancherClustersImportYaml } from 'waldur-js-client';

import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { closeModalDialog } from '@/modal/actions';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const ImportYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { cluster_id } }
>({ form: 'ImportYAMLDialog' })(({ resolve, handleSubmit, submitting }) => {
  const dispatch = useDispatch();

  const handler = useCallback(
    async (formData) => {
      try {
        await rancherClustersImportYaml({
          path: { uuid: resolve.cluster_id },
          body: { yaml: formData.yaml },
        });
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
      <MonacoField name="yaml" language="yaml" height={200} />
    </ActionDialog>
  );
});
