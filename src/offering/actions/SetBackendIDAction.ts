import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { validatePermissions } from '@waldur/offering/actions/utils';
import { setBackendID } from '@waldur/offering/api';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

import { Offering } from '../types';

export default function setBackendIDAction({
  resource,
}): ResourceAction<Offering> {
  return {
    name: 'set_backend_id',
    title: translate('Set backend ID'),
    type: 'form',
    method: 'POST',
    component: ResourceActionDialog,
    useResolve: true,
    validators: [validatePermissions],
    getInitialValues: () => ({
      backend_id: resource.backend_id,
    }),
    fields: [
      {
        name: 'backend_id',
        label: translate('Backend ID'),
        required: true,
        type: 'string',
      },
    ],
    submitForm: async (dispatch, formData) => {
      try {
        await setBackendID(resource.uuid, formData);
        dispatch(
          showSuccess(translate('Backend ID has been successfully set.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to set backend ID.')));
      }
    },
  };
}
