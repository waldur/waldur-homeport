import { ChartBarIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingUsage } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingUsageAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingUsage({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering usage synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering usage.'),
  });

  return (
    <ActionItem
      title={translate('Pull usage')}
      action={mutate}
      iconNode={<ChartBarIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
