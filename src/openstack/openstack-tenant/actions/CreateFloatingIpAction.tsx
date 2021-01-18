import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { createFloatingIp } from '@waldur/openstack/api';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';
import { AsyncActionButton } from '@waldur/resource/actions/AsyncActionButton';
import { validateState } from '@waldur/resource/actions/base';
import { ActionContext } from '@waldur/resource/actions/types';

import { TenantActionProps } from './types';

function checkExternalNetwork(ctx: ActionContext<OpenStackTenant>): string {
  if (!ctx.resource.external_network_id) {
    return translate(
      'Cannot create floating IP if tenant external network is not defined.',
    );
  }
}

const validators = [validateState('OK'), checkExternalNetwork];

export const CreateFloatingIpAction: FC<TenantActionProps> = ({ resource }) => (
  <AsyncActionButton
    title={translate('Create')}
    icon="fa fa-plus"
    resource={resource}
    validators={validators}
    apiMethod={createFloatingIp}
  />
);
