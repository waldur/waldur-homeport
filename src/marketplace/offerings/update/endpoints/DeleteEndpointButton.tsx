import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { deleteOfferingEndpoint } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const DeleteEndpointButton = ({ endpoint, offering, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete endpoint {name}?',
          {
            name: <b>{endpoint.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    try {
      await deleteOfferingEndpoint(offering.uuid, endpoint.uuid);
      dispatch(showSuccess(translate('Endpoint has been removed.')));
      await refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to remove endpoint.')),
      );
    }
  };
  return (
    <Button className="btn-sm btn-danger" onClick={handler}>
      {translate('Delete')}
    </Button>
  );
};
