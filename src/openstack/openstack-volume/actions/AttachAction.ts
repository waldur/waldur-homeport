import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { validateRuntimeState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { VirtualMachine } from '@waldur/resource/types';

export default function createAction(): ResourceAction {
  return {
    name: 'attach',
    type: 'form',
    method: 'POST',
    title: translate('Attach'),
    validators: [
      validateRuntimeState('available'),
    ],
    init: async (resource, _, action) => {
      const params = {
        attach_volume_uuid: resource.uuid,
        field: ['url', 'name'],
      };
      const instances = await getAll<VirtualMachine>('/openstacktenant-instances/', {params});
      action.fields.instance.choices = instances.map(choice => ({
        value: choice.url,
        display_name: choice.name,
      }));
    },
    fields: [
      {
        name: 'instance',
        label: translate('Instance'),
        type: 'select',
        required: true,
      },
      {
        name: 'device',
        label: translate('Device'),
        type: 'string',
        help_text: translate('Name of volume as instance device e.g. /dev/vdb.'),
        required: false,
      },
    ],
  };
}
