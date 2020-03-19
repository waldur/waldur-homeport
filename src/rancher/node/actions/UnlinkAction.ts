import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'unlink_openstack',
    type: 'form',
    method: 'POST',
    title: translate('Unlink instance'),
    isVisible: ctx.resource.instance !== null && ctx.user.is_staff,
    dialogSubtitle: translate('Do you want to unlink instance {name}?', {
      name: ctx.resource.instance_name,
    }),
  };
}
