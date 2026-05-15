import { CloudArrowDownIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingDetails } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingDetailsAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingDetails({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering details synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering details.'),
  });

  return (
    <ActionItem
      title={translate('Pull offering details')}
      action={mutate}
      iconNode={<CloudArrowDownIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
