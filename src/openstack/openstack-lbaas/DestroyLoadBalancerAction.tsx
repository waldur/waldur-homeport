import { TrashIcon } from '@phosphor-icons/react';
import {
  OpenStackLoadBalancer,
  openstackLoadbalancersDestroy,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useNotify } from '@/store/notify';

export const DestroyLoadBalancerAction: ActionItemType<
  OpenStackLoadBalancer
> = ({ resource, refetch }) => {
  const { confirm } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  const destroy = async () => {
    try {
      await confirm(
        translate('Removing load balancer'),
        translate('Are you sure you want to remove this load balancer?'),
        { forDeletion: true, positiveButton: translate('Remove') },
      );
    } catch {
      return;
    }
    try {
      await openstackLoadbalancersDestroy({ path: { uuid: resource.uuid } });
      showSuccess(translate('Load balancer was removed.'));
      if (refetch) refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to remove load balancer.'));
    }
  };

  return (
    <ActionItem
      title={translate('Remove load balancer')}
      action={destroy}
      iconNode={<TrashIcon weight="bold" />}
      iconColor="danger"
      className="text-danger"
    />
  );
};
