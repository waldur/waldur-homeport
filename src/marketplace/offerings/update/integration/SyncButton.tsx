import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsSync } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { VALID_OFFERING_TYPES } from './VALID_OFFERING_TYPES';

export const SyncButton = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await marketplaceProviderOfferingsSync({ path: { uuid: offering.uuid } });
      dispatch(
        showSuccess(translate('Service synchronization has been scheduled.')),
      );
      await refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          translate('Unable to schedule service synchronization.'),
        ),
      );
    }
  };

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
      action={callback}
      variant="tertiary"
      disabled={!enabled}
      disabledReason={translate('Synchronization is in progress')}
      pending={!enabled}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      title={translate('Synchronize')}
    />
  );
};
