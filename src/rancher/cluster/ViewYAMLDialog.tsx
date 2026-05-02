import { useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { reduxForm, Field } from 'redux-form';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { LoadingErred } from '@/core/LoadingErred';
import { SubmitButton } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const ViewYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { resource: { uuid?: string }; yamlRetrieve; yamlUpdate } }
>({ form: 'ViewYAMLDialog', enableReinitialize: true })(({
  resolve,
  handleSubmit,
  submitting,
  initialize,
}) => {
  const [{ loading, error, value }, fetch] = useAsyncFn(() =>
    resolve
      .yamlRetrieve({ path: { uuid: resolve.resource.uuid } })
      .then((response) => response.data.yaml),
  );

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (value) {
      initialize({ yaml: value as string });
    }
  }, [value, initialize]);

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
    return <LoadingErred loadData={fetch} />;
  }

  return (
    <ActionDialog
      title={translate('Edit YAML')}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit((values) =>
        updateYamlMutation.mutateAsync(values),
      )}
      submitting={submitting}
      loading={loading}
    >
      <Field
        name="yaml"
        language="yaml"
        component={MonacoField}
        original={value as string}
        diff={showDiff}
        height={400}
        options={{ scrollBeyondLastLine: false }}
      />

      {value && (
        <>
          <CopyToClipboard value={value} textButton className="my-2" />{' '}
          <SubmitButton
            submitting={false}
            onClick={toggleShowDiff}
            type="button"
            label={showDiff ? translate('Hide diff') : translate('Show diff')}
          />
        </>
      )}
    </ActionDialog>
  );
});
