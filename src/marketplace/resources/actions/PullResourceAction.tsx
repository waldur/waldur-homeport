import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { remoteWaldurApiSyncResource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullResourceAction = ({ resource, ...rest }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiSyncResource({ path: { uuid: resource.uuid } }),
    successMessage: translate('Pulling resource has been scheduled.'),
    errorMessage: translate('Unable to schedule pull resource action.'),
  });

  return resource.offering_type === REMOTE_OFFERING_TYPE ? (
    <ActionItem
      title={translate('Pull resource')}
      action={mutate}
      disabled={isPending}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
    />
  ) : null;
};
