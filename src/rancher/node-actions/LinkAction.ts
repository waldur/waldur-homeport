import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { OpenStackInstance } from '@waldur/openstack/openstack-instance/types';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'link_openstack',
    type: 'form',
    method: 'POST',
    title: translate('Link OpenStack Instance'),
    isVisible: !ctx.resource.instance && ctx.user.is_staff,
    init: async (resource, _, action) => {
      const instances = await getAll<OpenStackInstance>(
        '/openstacktenant-instances/', {params: {
          project_uuid: resource.project_uuid,
          o: 'name',
        }});

      action.fields.instance.choices = instances.map(choice => ({
        value: choice.url,
        display_name: choice.name,
      }));
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
