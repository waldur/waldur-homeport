import { translate } from '@waldur/i18n';
import { loadInstances } from '@waldur/openstack/api';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'link_openstack',
    type: 'form',
    method: 'POST',
    title: translate('Link OpenStack Instance'),
    validators: [validateState('OK')],
    init: async (_, __, action) => {
      const instances = await loadInstances();

      action.fields.instance.choices = instances.map(choice => ({
        value: choice.url,
        display_name: choice.name,
      }));
    },
    serializer: form => {
      return {
        instance: form.instance.url,
      };
    },
    fields: [
      {
        name: 'instance',
        type: 'select',
        required: true,
        label: translate('OpenStack instance'),
      },
    ],
  };
}
