import { TrashIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceProviderOfferingsRemoveOfferingComponent } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const DeleteComponentButton = ({ offering, component, refetch }) => {
  const dispatch = useDispatch();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete component {name}?',
          { name: <b>{component.name}</b> },
          formatJsxTemplate,
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }

    try {
      await marketplaceProviderOfferingsRemoveOfferingComponent({
        path: { uuid: offering.uuid },
        body: { uuid: component.uuid },
      });
      refetch();
      dispatch(showSuccess(translate('Component has been removed.')));
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to remove component.')),
      );
    }
  };
  return (
    <ActionItem
      className="text-danger"
      iconColor="danger"
      title={translate('Delete')}
      action={handler}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
