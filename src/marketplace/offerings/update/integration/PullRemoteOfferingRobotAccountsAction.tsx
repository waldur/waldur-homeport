import { RobotIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingRobotAccounts } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingRobotAccountsAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingRobotAccounts({
        path: { uuid: offering.uuid },
      }),
    successMessage: translate(
      'Robot accounts synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize robot accounts.'),
  });

  return (
    <ActionItem
      title={translate('Pull robot accounts')}
      action={mutate}
      iconNode={<RobotIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
