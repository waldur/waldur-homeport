import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { marketplaceResourcesPull } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionContext } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';

const SUPPORTED_OFFERING_TYPES = [
  'Marketplace.Slurm',
  'OpenStack.Tenant',
  'OpenStack.Instance',
  'OpenStack.Volume',
  'Marketplace.Rancher',
  'Azure.VirtualMachine',
  'VMware.VirtualMachine',
];

const hasBackendId = (ctx: ActionContext) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [validateState('OK', 'ERRED'), hasBackendId];

export const PullMarketplaceResourceAction = ({
  resource,
  refetch,
  ...rest
}) => {
  const validationState = useValidators(validators, resource);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourcesPull({
        path: {
          uuid: resource.marketplace_resource_uuid || resource.uuid,
        },
      }),
    refetch,
    successMessage: translate('Marketplace resource pull has been scheduled.'),
    errorMessage: translate('Unable to pull marketplace resource.'),
  });

  if (
    !SUPPORTED_OFFERING_TYPES.includes(
      resource.marketplace_offering_type || resource.offering_type,
    )
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Pull')}
      action={mutate}
      disabled={isPending || validationState.disabled}
      tooltip={validationState.tooltip}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
