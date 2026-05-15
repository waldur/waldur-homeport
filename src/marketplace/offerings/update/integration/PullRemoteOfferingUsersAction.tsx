import { UsersIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingUsers } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingUsersAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingUsers({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering users synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering users.'),
  });

  return (
    <ActionItem
      title={translate('Pull offering users')}
      action={mutate}
      iconNode={<UsersIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
