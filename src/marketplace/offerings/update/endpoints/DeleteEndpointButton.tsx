import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsDeleteEndpoint } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

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
        { forDeletion: true },
      );
    } catch {
      return;
    }
    try {
      await marketplaceProviderOfferingsDeleteEndpoint({
        path: { uuid: offering.uuid },
        body: { uuid: endpoint.uuid },
      });
      dispatch(showSuccess(translate('Endpoint has been removed.')));
      await refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to remove endpoint.')),
      );
    }
  };
  return (
    <CompactActionButton
      variant="danger"
      action={handler}
      title={translate('Delete')}
    />
  );
};
