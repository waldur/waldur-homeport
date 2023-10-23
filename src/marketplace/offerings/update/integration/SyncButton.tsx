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

  return (
    <Button onClick={callback} size="sm" variant="light" className="me-3">
      <i className="fa fa-refresh"></i> {translate('Synchronize')}
    </Button>
  );
};
