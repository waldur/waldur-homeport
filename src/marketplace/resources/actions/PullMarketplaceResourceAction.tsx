import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesPull } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionContext } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';
import { showErrorResponse, showSuccess } from '@/store/notify';

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
  const dispatch = useDispatch();
  const { tooltip, disabled } = useValidators(validators, resource);

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
      action={async () => {
        try {
          await marketplaceResourcesPull({
            path: {
              uuid: resource.marketplace_resource_uuid || resource.uuid,
            },
          });
          if (refetch) {
            await refetch();
          }
          dispatch(
            showSuccess(
              translate('Marketplace resource pull has been scheduled.'),
            ),
          );
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to pull marketplace resource.'),
            ),
          );
        }
      }}
      disabled={disabled}
      tooltip={tooltip}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
