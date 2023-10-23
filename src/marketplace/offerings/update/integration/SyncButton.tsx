import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { post } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

  const enabled = ['OK', 'Erred'].includes(offering.state);

  return (
    <Button
      onClick={callback}
      size="sm"
      variant="light"
      className="me-3"
      disabled={!enabled}
    >
      {enabled ? (
        <i className="fa fa-refresh"></i>
      ) : (
        <i className="fa-spinner fa-spin"></i>
      )}{' '}
      {translate('Synchronize')}
    </Button>
  );
};
