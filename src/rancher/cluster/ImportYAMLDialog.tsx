import { reduxForm } from 'redux-form';
import { rancherClustersImportYaml } from 'waldur-js-client';

import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const ImportYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { cluster_id } }
>({ form: 'ImportYAMLDialog' })(({ resolve, handleSubmit, submitting }) => {
  const { mutateAsync } = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      rancherClustersImportYaml({
        path: { uuid: resolve.cluster_id },
        body: { yaml: formData.yaml },
      }),
    successMessage: translate('YAML has been imported.'),
    errorMessage: translate('Unable to import YAML.'),
  });

  return (
    <ActionDialog
      title={translate('Import YAML')}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit((values) => mutateAsync(values))}
      submitting={submitting}
    >
      <MonacoField name="yaml" language="yaml" height={200} />
    </ActionDialog>
  );
});
