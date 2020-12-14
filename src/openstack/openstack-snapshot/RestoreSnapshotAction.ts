import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { restoreSnapshot } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
  validateState,
} from '@waldur/resource/actions/base';
import { LazyResourceActionDialog } from '@waldur/resource/actions/LazyResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'restore',
    type: 'form',
    method: 'POST',
    title: translate('Restore'),
    dialogTitle: translate('Restore volume snapshot'),
    fields: [createLatinNameField(), createDescriptionField()],
    validators: [validateState('OK')],
    component: LazyResourceActionDialog,
    submitForm: async (dispatch, formData) => {
      try {
        await restoreSnapshot(resource.uuid, formData);
        dispatch(showSuccess(translate('Volume snapshot has been restored.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to restore volume snapshot.')),
        );
      }
    },
  };
}
