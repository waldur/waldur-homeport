import { put } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import {
  createDefaultEditAction,
  createLatinNameField,
  validateState,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { mergeActions } from '@waldur/resource/actions/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/coreSaga';

const updateInstance = (id, data) =>
  put(`/openstacktenant-instances/${id}/`, data);

export default function createAction({ resource }): ResourceAction {
  return mergeActions(createDefaultEditAction(), {
    fields: [createLatinNameField()],
    validators: [validateState('OK')],
    component: ResourceActionDialog,
    useResolve: true,
    getInitialValues: () => ({
      name: resource.name,
      description: resource.description,
    }),
    submitForm: async (dispatch, formData) => {
      try {
        await updateInstance(resource.uuid, formData);
        dispatch(showSuccess(translate('Instance has been updated.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, 'Unable to update instance'));
      }
    },
  });
}
