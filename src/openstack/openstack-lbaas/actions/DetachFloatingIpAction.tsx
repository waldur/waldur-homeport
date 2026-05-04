import { LinkBreakIcon } from '@phosphor-icons/react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersDetachFloatingIp,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';

const DetachFloatingIpButton = ({
  resource,
  refetch,
}: {
  resource: OpenStackLoadBalancer;
  refetch?(): void;
}) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const detach = async () => {
    try {
      await confirm(
        translate('Detach floating IP'),
        translate(
          'Are you sure you want to detach the floating IP from this load balancer?',
        ),
        { positiveButton: translate('Detach') },
      );
    } catch {
      return;
    }
    try {
      await openstackLoadbalancersDetachFloatingIp({
        path: { uuid: resource.uuid },
      });
      showSuccess(translate('Floating IP is being detached.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to detach floating IP.'));
    }
  };

  return (
    <ActionItem
      title={translate('Detach floating IP')}
      action={detach}
      iconNode={<LinkBreakIcon weight="bold" />}
    />
  );
};

export const DetachFloatingIpAction: ActionItemType = ({
  resource,
  refetch,
}) => {
  if (!resource.attached_floating_ip) return null;
  return <DetachFloatingIpButton resource={resource} refetch={refetch} />;
};
