import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { setBackendID } from '@waldur/offering/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

export const SetBackendIdDialog = ({ resolve: { resource } }) => {
  const dispatch = useDispatch();
  return (
    <ResourceActionDialog
      dialogTitle={translate('Set backend ID')}
      fields={[
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
          await setBackendID(resource.uuid, formData);
          dispatch(
            showSuccess(translate('Backend ID has been successfully set.')),
          );
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
