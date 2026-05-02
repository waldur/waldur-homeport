import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { remoteWaldurApiPullOrder } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullOrderAction = ({ resource, ...rest }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullOrder({
        path: { uuid: resource.order_in_progress.uuid },
      }),
    successMessage: translate('Pulling resource order has been scheduled.'),
    errorMessage: translate('Unable to schedule pull resource order action.'),
  });

  return resource.offering_type === REMOTE_OFFERING_TYPE ? (
    <ActionItem
      title={translate('Pull resource order')}
      action={mutate}
      disabled={isPending}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
    />
  ) : null;
};
