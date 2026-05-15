import { DatabaseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPullOfferingResources } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRemoteOfferingResourcesAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOfferingResources({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering resources synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering resources.'),
  });

  return (
    <ActionItem
      title={translate('Pull resources')}
      action={mutate}
      iconNode={<DatabaseIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
