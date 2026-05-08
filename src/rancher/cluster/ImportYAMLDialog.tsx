import { FC } from 'react';
import { Form } from 'react-final-form';
import { rancherClustersImportYaml } from 'waldur-js-client';

import { FormContainerFinal } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ImportYAMLDialogProps {
  resolve: {
    cluster_id: string;
  };
}

export const ImportYAMLDialog: FC<ImportYAMLDialogProps> = ({
  resolve: { cluster_id },
}) => {
  const { mutateAsync } = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      rancherClustersImportYaml({
        path: { uuid: cluster_id },
        body: { yaml: formData.yaml },
      }),
    successMessage: translate('YAML has been imported.'),
    errorMessage: translate('Unable to import YAML.'),
  });

  return (
    <Form
      onSubmit={mutateAsync}
      render={({ handleSubmit, submitting, invalid }) => (
        <ActionDialog
          title={translate('Import YAML')}
          submitLabel={translate('Submit')}
          onSubmit={handleSubmit}
          submitting={submitting}
          invalid={invalid}
        >
          <FormContainerFinal submitting={submitting}>
            <MonacoField name="yaml" language="yaml" height={200} />
          </FormContainerFinal>
        </ActionDialog>
      )}
    />
  );
};
