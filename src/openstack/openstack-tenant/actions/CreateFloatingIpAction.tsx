import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackTenantsCreateFloatingIp } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OpenStackTenant } from '@/openstack/openstack-tenant/types';
import { AsyncActionButton } from '@/resource/actions/AsyncActionButton';
import { validateState } from '@/resource/actions/base';
import { ActionContext } from '@/resource/actions/types';

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
    apiMethod={(uuid, data) => {
      const requestParams: any = {
        path: { uuid },
      };
      if (data?.router) {
        requestParams.body = { router: data.router };
      }
      return openstackTenantsCreateFloatingIp(requestParams);
    }}
    refetch={refetch}
    hasConfirmation
    actionTitle={translate('Create floating IP')}
    confirmationOptions={{
      showRouterSelect: true,
      tenantUuid: resource.uuid,
    }}
  />
);
