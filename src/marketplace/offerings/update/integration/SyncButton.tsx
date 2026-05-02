import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { marketplaceProviderOfferingsSync } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionButton } from '@/table/ActionButton';

import { VALID_OFFERING_TYPES } from './VALID_OFFERING_TYPES';

export const SyncButton = ({ offering, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsSync({ path: { uuid: offering.uuid } }),
    successMessage: translate('Service synchronization has been scheduled.'),
    errorMessage: translate('Unable to schedule service synchronization.'),
    refetch,
  });

  useQuery({
    queryKey: ['SyncButton', offering.scope],
    queryFn: refetch,
    enabled: Boolean(
      offering.scope_state && !['OK', 'ERRED'].includes(offering.scope_state),
    ),
    refetchInterval: 5000,
  });

  if (!offering.scope) {
    // Offering does not have service settings
    return null;
  }

  if (!VALID_OFFERING_TYPES.includes(offering.type)) {
    // Plugin does not support this operation
    return null;
  }

  const enabled = ['OK', 'ERRED'].includes(offering.scope_state);

  return (
    <ActionButton
      action={mutate}
      variant="tertiary"
      disabled={!enabled || isPending}
      disabledReason={translate('Synchronization is in progress')}
      pending={!enabled}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      title={translate('Synchronize')}
    />
  );
};
