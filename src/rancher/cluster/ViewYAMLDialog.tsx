import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { useToggle } from 'react-use';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { FormFooter, SubmitButton } from '@/form';
import { FormContainerFinal } from '@/form/FormContainerFinal';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ViewYAMLDialogProps {
  resolve: {
    resource: { uuid?: string };
    yamlRetrieve;
    yamlUpdate;
  };
}

export const ViewYAMLDialog: FC<ViewYAMLDialogProps> = ({ resolve }) => {
  const {
    data: value,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cluster-yaml', resolve.resource.uuid],
    queryFn: () =>
      resolve
        .yamlRetrieve({ path: { uuid: resolve.resource.uuid } })
        .then((response) => response.data.yaml),
  });

  const initialValues = useMemo(() => ({ yaml: value as string }), [value]);

  const updateYamlMutation = useManagedMutation<any, any, { yaml: string }>({
    mutationFn: (formData) =>
      resolve.yamlUpdate({
        uuid: resolve.resource.uuid,
        body: {
          yaml: formData.yaml,
        },
      }),
    successMessage: translate('YAML has been updated.'),
    errorMessage: translate('Unable to update YAML.'),
  });

  const [showDiff, toggleShowDiff] = useToggle(false);

  if (error) {
    return <LoadingErred loadData={() => refetch()} />;
  }

  return (
    <Form<{ yaml: string }>
      onSubmit={(values) => updateYamlMutation.mutateAsync(values)}
      initialValues={initialValues}
      enableReinitialize={true}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit YAML')}
            footer={
              <FormFooter
                submitting={submitting}
                invalid={invalid}
                submitLabel={translate('Submit')}
              />
            }
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <FormContainerFinal submitting={submitting}>
                <Field
                  name="yaml"
                  language="yaml"
                  component={MonacoField as any}
                  original={value as string}
                  diff={showDiff}
                  height={400}
                  options={{ scrollBeyondLastLine: false }}
                />
              </FormContainerFinal>
            )}

            {value && !loading && (
              <div className="d-flex align-items-center gap-2 mt-4">
                <CopyToClipboard value={value as string} textButton />
                <SubmitButton
                  submitting={false}
                  onClick={toggleShowDiff}
                  type="button"
                  label={
                    showDiff ? translate('Hide diff') : translate('Show diff')
                  }
                />
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
