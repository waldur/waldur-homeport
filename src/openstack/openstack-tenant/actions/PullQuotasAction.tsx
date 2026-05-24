import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { ReactElement } from 'react';
import { openstackTenantsPullQuotas } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionItemType } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';

const validators = [validateState('OK', 'ERRED')];

export const PullQuotasAction: ActionItemType = ({
  resource,
  refetch,
  ...rest
}): ReactElement => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openstackTenantsPullQuotas({ path: { uuid: resource.uuid } }),
    successMessage: translate('Quota refresh has been scheduled.'),
    errorMessage: translate('Unable to refresh quotas.'),
    refetch,
  });

  const { tooltip, disabled } = useValidators(validators, resource);

  return (
    <ActionItem
      title={translate('Refresh quotas')}
      action={mutate}
      disabled={disabled || isPending}
      tooltip={tooltip}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      {...rest}
    />
  );
};
