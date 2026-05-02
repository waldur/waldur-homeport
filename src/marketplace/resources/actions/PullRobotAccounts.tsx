import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { remoteWaldurApiPullResourceRobotAccounts } from 'waldur-js-client';

import { translate } from '@/i18n';
import { REMOTE_OFFERING_TYPE } from '@/marketplace-remote/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const PullRobotAccounts = ({ resource, ...rest }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      remoteWaldurApiPullResourceRobotAccounts({
        path: { uuid: resource.uuid },
      }),
    successMessage: translate(
      'Pulling resource robot accounts has been scheduled.',
    ),
    errorMessage: translate(
      'Unable to schedule pull resource robot accounts action.',
    ),
  });

  return resource.offering_type === REMOTE_OFFERING_TYPE ? (
    <ActionItem
      title={translate('Pull robot accounts')}
      action={mutate}
      disabled={isPending}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      staff
    />
  ) : null;
};
