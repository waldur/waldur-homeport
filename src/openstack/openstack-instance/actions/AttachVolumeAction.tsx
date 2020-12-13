import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { attachVolume } from '@waldur/openstack/api';
import {
  validateRuntimeState,
  validateState,
} from '@waldur/resource/actions/base';
import { LazyResourceActionDialog } from '@waldur/resource/actions/LazyResourceActionDialog';
import { ActionContext } from '@waldur/resource/actions/types';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

import { OpenStackInstance } from '../types';

const getAttachableVolumes = (instanceId, query) =>
  getAll('/openstacktenant-volumes/', {
    params: {
      name: query,
      attach_instance_uuid: instanceId,
      o: 'name',
      runtime_state: 'available',
    },
  }).then((options) => ({
    options,
  }));

export default function createAction(ctx: ActionContext<OpenStackInstance>) {
  return {
    name: 'attach',
    type: 'form',
    method: 'POST',
    tab: 'volumes',
    iconClass: 'fa fa-plus',
    title: translate('Attach volume'),
    validators: [
      validateState('OK'),
      validateRuntimeState('SHUTOFF', 'ACTIVE'),
    ],
    component: LazyResourceActionDialog,
    useResolve: true,
    submitForm: async (dispatch, formData) => {
      try {
        await attachVolume(formData.volume.uuid, ctx.resource.url);
        dispatch(showSuccess(translate('Attach has been scheduled.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to attach volume.')));
      }
    },
    fields: [
      {
        name: 'volume',
        label: translate('Volume'),
        type: 'async_select',
        loadOptions: (query) => getAttachableVolumes(ctx.resource.uuid, query),
      },
    ],
  };
}
