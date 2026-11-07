import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import {
  marketplaceProviderResourcesPull,
  marketplaceResourcesPull,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionContext } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';
import {
  LEGACY_SITE_AGENT_PLUGIN,
  SITE_AGENT_PLUGIN,
} from '@/site-agent/constants';
import { useUser } from '@/workspace/hooks';

import { useIsProviderAction } from './ProviderActionContext';
import { getMarketplaceResourceUuid } from './utils';

const SUPPORTED_OFFERING_TYPES = [
  LEGACY_SITE_AGENT_PLUGIN,
  SITE_AGENT_PLUGIN,
  'OpenStack.Tenant',
  'OpenStack.Instance',
  'OpenStack.Volume',
  'Marketplace.Rancher',
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
  const user = useUser();
  const validationState = useValidators(validators, resource);
  const isProvider = useIsProviderAction();
  const pull = isProvider
    ? marketplaceProviderResourcesPull
    : marketplaceResourcesPull;
  // A pull talks to the provider's backend: it takes a permission of its own
  // on either side, not just seeing the resource.
  const canPull = isProvider
    ? hasPermission(user, {
        permission: PermissionEnum.PULL_RESOURCE,
        customerId: resource.provider_uuid,
        offeringId: resource.offering_uuid,
      })
    : hasPermission(user, {
        permission: PermissionEnum.PULL_RESOURCE,
        projectId: resource.project_uuid,
        customerId: resource.customer_uuid,
      });

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      pull({
        path: {
          uuid: getMarketplaceResourceUuid(resource),
        },
      }),
    refetch,
    successMessage: translate('Marketplace resource pull has been scheduled.'),
    errorMessage: translate('Unable to pull marketplace resource.'),
  });

  if (
    !canPull ||
    !getMarketplaceResourceUuid(resource) ||
    !SUPPORTED_OFFERING_TYPES.includes(
      resource.marketplace_offering_type || resource.offering_type,
    )
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Synchronize')}
      action={mutate}
      disabled={isPending || validationState.disabled}
      tooltip={validationState.tooltip}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
