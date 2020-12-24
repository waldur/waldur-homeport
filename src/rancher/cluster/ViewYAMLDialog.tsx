import { useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useAsync, useToggle } from 'react-use';
import { reduxForm, change } from 'redux-form';

import { CopyToClipboard } from '@waldur/core/CopyToClipboard';
import { MonacoField } from '@waldur/form/MonacoField';
import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { getYAML, putYAML } from '../api';

export const ViewYAMLDialog = reduxForm<
  { yaml: string },
  { resolve: { resource: { url: string } } }
>({ form: 'ViewYAMLDialog' })(({ resolve, handleSubmit, submitting }) => {
  const dispatch = useDispatch();

  const { loading, value } = useAsync(() => getYAML(resolve.resource.url));

  useEffect(() => {
    if (value) {
      dispatch(change('ViewYAMLDialog', 'yaml', value.yaml));
    }
  }, [dispatch, value]);

  const updateYAML = useCallback(
    async (formData) => {
      try {
        await putYAML(resolve.resource.url, formData.yaml);
        dispatch(showSuccess(translate('YAML has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update YAML.')));
      }
    },
    [dispatch, resolve.resource.url],
  );

  const [showDiff, toggleShowDiff] = useToggle(false);

  return (
    <ActionDialog
      title={translate('Edit YAML')}
      submitLabel={translate('Submit')}
      onSubmit={handleSubmit(updateYAML)}
      submitting={submitting}
      loading={loading}
    >
      <MonacoField
        name="yaml"
        mode="yaml"
        original={value?.yaml}
        diff={showDiff}
        height={400}
        options={{ scrollBeyondLastLine: false }}
      />
      {value?.yaml && (
        <>
          <CopyToClipboard value={value.yaml} />{' '}
          <Button onClick={toggleShowDiff}>
            {showDiff ? translate('Hide diff') : translate('Show diff')}
          </Button>
        </>
      )}
    </ActionDialog>
  );
});
