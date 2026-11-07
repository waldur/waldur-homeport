import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { proposalProposalsProvisionAwardedItem } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { awardedResourcesKey } from '@/proposals/awardedResources';

interface ProvisionErrorAlertProps {
  proposalUuid: string;
  awardedResourceUuid: string;
  error: string;
  /** The call's managers may order the item again; others only read why. */
  canProvision: boolean;
}

/**
 * Why allocation could not order an awarded item, with the way to order it
 * again once the cause is fixed. A refusal that still holds comes back as a
 * 409 whose detail says why, shown as the error.
 */
export const ProvisionErrorAlert: FC<ProvisionErrorAlertProps> = ({
  proposalUuid,
  awardedResourceUuid,
  error,
  canProvision,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsProvisionAwardedItem({
        path: { uuid: proposalUuid },
        body: { awarded_resource_uuid: awardedResourceUuid },
      }),
    invalidateQueries: [{ queryKey: awardedResourcesKey(proposalUuid) }],
    closeModal: false,
    successMessage: translate('The item has been ordered again.'),
    errorMessage: translate('Unable to order the item again.'),
  });
  return (
    <AlertItem
      type="floating"
      variant="error"
      title={translate('Not provisioned')}
      body={error}
      actions={
        canProvision ? (
          <BaseButton
            label={translate('Provision again')}
            iconNode={<ArrowClockwiseIcon weight="bold" />}
            variant="tertiary"
            size="sm"
            pending={isPending}
            onClick={() => mutate()}
          />
        ) : null
      }
    />
  );
};
