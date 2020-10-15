import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createBackup } from '@waldur/openstack/api';
import {
  validateState,
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import {
  ResourceActionDialog,
  RESOURCE_ACTION_FORM,
} from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'backup',
    type: 'form',
    method: 'POST',
    tab: 'backups',
    title: translate('Create'),
    dialogTitle: translate('Create VM snapshot for OpenStack instance'),
    iconClass: 'fa fa-plus',
    validators: [validateState('OK')],
    fields: [
      createLatinNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        type: 'datetime',
        required: false,
        label: translate('Kept until'),
        help_text: translate(
          'Guaranteed time of VM snapshot retention. If null - keep forever.',
        ),
      },
    ],
    component: ResourceActionDialog,
    formId: RESOURCE_ACTION_FORM,
    useResolve: true,
    getInitialValues: () => ({
      name: resource.name + '-snapshot',
    }),
    submitForm: async (dispatch, formData) => {
      try {
        await createBackup(resource.uuid, formData);
        dispatch(showSuccess(translate('VM snapshot has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create VM snapshot.')),
        );
      }
    },
  };
}
