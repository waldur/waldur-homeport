import { CloudArrowUpIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { remoteWaldurApiPushProjectData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PushRemoteOfferingProjectDataAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPushProjectData({ path: { uuid: offering.uuid } }),
    successMessage: translate(
      'Offering project data synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering project data.'),
  });

  return (
    <ActionItem
      title={translate('Push project data')}
      action={mutate}
      iconNode={<CloudArrowUpIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
