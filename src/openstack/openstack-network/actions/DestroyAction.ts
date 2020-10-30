import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import store from '@waldur/store/store';
import { fetchListStart } from '@waldur/table/actions';

export default function createAction(ctx): ResourceAction {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [validateState('OK', 'Erred')],
    onSuccess: () =>
      store.dispatch(
        fetchListStart('openstack-networks', {
          tenant_uuid: ctx.resource.tenant_uuid,
        }),
      ),
  };
}
