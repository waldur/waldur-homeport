import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { openstackInstancesPull } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionContext, ActionItemType } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';

const hasBackendId = (ctx: ActionContext) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [
  validateState('OK', 'ERRED'),
  hasBackendId,
  validateOpenStackInstanceManagePermission,
];

export const PullInstanceAction: ActionItemType = ({ resource, refetch }) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  const { mutate, isPending = false } = useManagedMutation<any, any, void>({
    mutationFn: () => openstackInstancesPull({ path: { uuid: resource.uuid } }),
    successMessage: translate('Resource sync has been scheduled.'),
    errorMessage: translate('Unable to sync resource.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Synchronise')}
      action={mutate}
      disabled={disabled || isPending}
      tooltip={tooltip}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
