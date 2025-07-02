import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsCreateFloatingIp } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
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

export const CreateFloatingIpAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => (
  <AsyncActionButton
    title={translate('Create')}
    iconNode={<PlusCircleIcon weight="bold" />}
    resource={resource}
    validators={validators}
    apiMethod={(uuid) => openstackTenantsCreateFloatingIp({ path: { uuid } })}
    refetch={refetch}
    hasConfirmation
    actionTitle={translate('Create floating IP')}
  />
);
