import { ArrowsClockwise } from '@phosphor-icons/react';
import { Button, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { VALID_OFFERING_TYPES } from './VALID_OFFERING_TYPES';

export const SyncButton = ({ offering, refetch }) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await post(`/marketplace-provider-offerings/${offering.uuid}/sync/`);
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

  if (!offering.scope) {
    // Offering does not have service settings
    return null;
  }

  if (!VALID_OFFERING_TYPES.includes(offering.type)) {
    // Plugin does not support this operation
    return null;
  }

  const enabled = ['OK', 'Erred'].includes(offering.scope_state);

  return (
    <Button onClick={callback} variant="light" disabled={!enabled}>
      <span className="svg-icon svg-icon-2">
        {enabled ? <ArrowsClockwise /> : <Spinner className="fa-spin" />}
      </span>{' '}
      {translate('Synchronize')}
    </Button>
  );
};
