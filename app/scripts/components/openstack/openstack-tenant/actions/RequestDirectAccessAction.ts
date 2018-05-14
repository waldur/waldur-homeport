import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'direct_access',
    type: 'form',
    method: 'POST',
    title: translate('Request direct access'),
    component: 'openstackTenantRequestDirectAccess',
    useResolve: true,
    isVisible: !ENV.plugins.WALDUR_OPENSTACK.TENANT_CREDENTIALS_VISIBLE,
  };
}
