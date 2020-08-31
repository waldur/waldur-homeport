import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { createSnapshot } from '@waldur/openstack/api';
import {
  createLatinNameField,
  createDescriptionField,
} from '@waldur/resource/actions/base';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import { ResourceAction } from '@waldur/resource/actions/types';
import { showSuccess, showErrorResponse } from '@waldur/store/coreSaga';

export default function createAction({ resource }): ResourceAction {
  return {
    name: 'snapshot',
    type: 'form',
    tab: 'snapshots',
    method: 'POST',
    title: translate('Create'),
    dialogTitle: translate('Create snapshot for OpenStack volume'),
    iconClass: 'fa fa-plus',
    fields: [
      createLatinNameField(),
      createDescriptionField(),
      {
        name: 'kept_until',
        type: 'datetime',
        required: false,
        label: translate('Kept until'),
        help_text: translate(
          'Guaranteed time of snapshot retention. If null - keep forever.',
        ),
      },
    ],
    component: ResourceActionDialog,
    useResolve: true,
    getInitialValues: () => ({
      name: resource.name + '-snapshot',
    }),
    submitForm: async (dispatch, formData) => {
      try {
        await createSnapshot(resource.uuid, formData);
        dispatch(showSuccess(translate('Volume snapshot has been created.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Unable to create volume snapshot.')),
        );
      }
    },
  };
}
