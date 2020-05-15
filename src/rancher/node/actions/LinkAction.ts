import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getInstances } from '@waldur/openstack/api';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'link_openstack',
    type: 'form',
    method: 'POST',
    title: translate('Link OpenStack Instance'),
    isVisible:
      !ctx.resource.instance &&
      ctx.user.is_staff &&
      !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE,
    init: async (resource, _, action) => {
      const instances = await getInstances({
        project_uuid: resource.project_uuid,
        o: 'name',
      });

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
