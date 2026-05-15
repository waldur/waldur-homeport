import { LinkBreakIcon } from '@phosphor-icons/react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersDetachFloatingIp,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';

export const DetachFloatingIpAction: ActionItemType<OpenStackLoadBalancer> = ({
  resource,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation({
    mutationFn: () =>
      openstackLoadbalancersDetachFloatingIp({
        path: { uuid: resource.uuid },
      }),
    successMessage: translate('Floating IP is being detached.'),
    errorMessage: translate('Unable to detach floating IP.'),
    confirmation: {
      title: translate('Detach floating IP'),
      body: translate(
        'Are you sure you want to detach the floating IP from this load balancer?',
      ),
      options: { positiveButton: translate('Detach') },
    },
    refetch,
  });

  if (!resource.attached_floating_ip) return null;

  return (
    <ActionItem
      title={translate('Detach floating IP')}
      action={() => mutate()}
      iconNode={<LinkBreakIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
