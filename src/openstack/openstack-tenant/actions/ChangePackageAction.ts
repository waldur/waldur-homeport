import { translate } from '@waldur/i18n';

import { marketplaceIsVisible } from '@waldur/marketplace/utils';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';
import { ActionContext, ResourceAction } from '@waldur/resource/actions/types';

import { userCanModifyTenant, tenantHasPackage } from './utils';

export default function createAction(ctx: ActionContext<OpenStackTenant>): ResourceAction {
  return {
    name: 'change_package',
    title: translate('Change VPC package'),
    type: 'form',
    method: 'POST',
    component: 'openstackTenantChangePackageDialog',
    useResolve: true,
    isVisible: !marketplaceIsVisible() && userCanModifyTenant(ctx) === undefined && tenantHasPackage(ctx.resource),
    dialogSize: 'lg',
  };
}
