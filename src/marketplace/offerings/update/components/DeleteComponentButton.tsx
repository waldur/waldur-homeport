import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { removeProviderOfferingComponent } from '@waldur/marketplace/common/api';
import { PROVIDER_OFFERING_DATA_QUERY_KEY } from '@waldur/marketplace/offerings/constants';
import { OfferingData } from '@waldur/marketplace/offerings/OfferingEditUIView';
import { formatComponent } from '@waldur/marketplace/offerings/store/utils';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const DeleteComponentButton = ({ offering, component }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete component {name}?',
          {
            name: <b>{component.name}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    const newComponents = offering.components.filter(
      (item) => item.type !== component.type,
    );
    try {
      const data = formatComponent(component);
      await removeProviderOfferingComponent(offering.uuid, data);
      queryClient.setQueryData<OfferingData>(
        [PROVIDER_OFFERING_DATA_QUERY_KEY, offering.uuid],
        (oldData) => ({
          ...oldData,
          offering: { ...oldData.offering, components: newComponents },
        }),
      );
      dispatch(showSuccess(translate('Component has been removed.')));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to remove component.')),
      );
    }
  };
  return (
    <Button className="btn-sm btn-danger" onClick={handler}>
      {translate('Delete')}
    </Button>
  );
};
