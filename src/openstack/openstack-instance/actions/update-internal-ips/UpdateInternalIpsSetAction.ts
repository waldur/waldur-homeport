import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const UpdateInternalIpsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "UpdateInternalIpsDialog" */ './UpdateInternalIpsDialog'
    ),
  'UpdateInternalIpsDialog',
);

export default function createAction(): ResourceAction {
  return {
    name: 'update_internal_ips_set',
    type: 'form',
    method: 'POST',
    tab: 'internal_ips',
    title: translate('Configure'),
    iconClass: 'fa fa-wrench',
    validators: [validateState('OK')],
    component: UpdateInternalIpsDialog,
  };
}
