import { translate } from '@waldur/i18n';
import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

import { tenantHasPackage } from './utils';

export default function createAction(ctx: ActionContext<OpenStackTenant>): ResourceAction {
  return {
    name: 'assign_package',
    type: 'form',
    method: 'POST',
    component: 'openstackTenantAssignPackageDialog',
    title: translate('Assign VPC package'),
    useResolve: true,
    isVisible: !marketplaceIsVisible() && ctx.user.is_staff && !tenantHasPackage(ctx.resource),
    dialogSize: 'lg',
  };
}
