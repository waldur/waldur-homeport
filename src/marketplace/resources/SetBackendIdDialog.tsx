import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { setBackendId } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SetBackendIdDialog = ({
  resolve: { resource, reInitResource },
}) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set backend ID')}
      formFields={[
        {
          name: 'backend_id',
          label: translate('Backend ID'),
          required: true,
          type: 'string',
        },
      ]}
      initialValues={{
        backend_id: resource.backend_id,
      }}
      submitForm={async (formData) => {
        try {
          await setBackendId(resource.uuid, formData);
          dispatch(
            showSuccess(translate('Backend ID has been successfully set.')),
          );
          if (reInitResource) {
            await reInitResource();
          }
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to set backend ID.')),
          );
        }
      }}
    />
  );
};
