import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn, useToggle } from 'react-use';
import { reduxForm, Field } from 'redux-form';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { LoadingErred } from '@/core/LoadingErred';
import { SubmitButton } from '@/form';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { ActionDialog } from '@/modal/ActionDialog';
import { closeModalDialog } from '@/modal/actions';
import { showSuccess, showErrorResponse } from '@/store/notify';

export const ViewYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { resource: { uuid?: string }; yamlRetrieve; yamlUpdate } }
>({ form: 'ViewYAMLDialog', enableReinitialize: true })(({
  resolve,
  handleSubmit,
  submitting,
  initialize,
}) => {
  const dispatch = useDispatch();

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

  const updateYAML = useCallback(
    async (formData: { yaml: string }) => {
      try {
        await resolve.yamlUpdate({
          uuid: resolve.resource.uuid,
          body: {
            yaml: formData.yaml,
          },
        });
        dispatch(showSuccess(translate('YAML has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update YAML.')));
      }
    },
    [dispatch, resolve.resource.uuid],
  );

  const [showDiff, toggleShowDiff] = useToggle(false);

  if (error) {
    return <LoadingErred loadData={fetch} />;
  }

  return (
    <ActionDialog
      title={translate('Edit YAML')}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit(updateYAML)}
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
