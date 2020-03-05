import { getAll } from '@waldur/core/api';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { VolumeType } from '@waldur/openstack/types';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'retype',
    type: 'form',
    method: 'POST',
    title: translate('Retype'),
    isVisible: isFeatureVisible('openstack.volume-types'),
    validators: [validateRuntimeState('available'), validateState('OK')],
    init: async (resource, _, action) => {
      const params = {
        settings_uuid: resource.service_settings_uuid,
        field: ['url', 'name', 'description'],
      };
      const types = await getAll<VolumeType>('/openstacktenant-volume-types/', {
        params,
      });
      action.fields.type.choices = types
        .map(volumeType => ({
          value: volumeType.url,
          display_name: volumeType.description
            ? `${volumeType.name} (${volumeType.description})`
            : volumeType.name,
        }))
        .filter(choice => choice.value !== resource.type);
    },
    fields: [
      {
        name: 'type',
        label: translate('Volume type'),
        type: 'select',
        required: true,
      },
    ],
  };
}
