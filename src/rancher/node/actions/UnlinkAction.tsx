import { LinkBreakIcon } from '@phosphor-icons/react';
import { rancherNodesUnlinkOpenstack } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionItemType } from '@/resource/actions/types';
import { useUser } from '@/workspace/hooks';

export const UnlinkAction: ActionItemType = ({ resource, refetch }) => {
  const user = useUser();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      rancherNodesUnlinkOpenstack({ path: { uuid: resource.uuid } }),
    successMessage: translate(
      'OpenStack instance has been unlinked from Rancher node.',
    ),
    errorMessage: translate('Unable to unlink instance from node.'),
    refetch,
    confirmation: {
      title: translate('Unlink instance'),
      body: translate(
        'Do you want to unlink instance {name}? Unlinking will only remove object from the database, it will not trigger any cleanup',
        {
          name: resource.instance_name,
        },
      ),
    },
  });
  if (
    resource.instance !== null &&
    user?.is_staff &&
    !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE
  ) {
    return (
      <ActionItem
        title={translate('Unlink instance')}
        action={mutate}
        disabled={isPending}
        staff
        iconNode={<LinkBreakIcon weight="bold" />}
      />
    );
  }
  return null;
};
