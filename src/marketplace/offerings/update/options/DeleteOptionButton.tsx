import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { updateOfferingOptions } from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OfferingData } from '../OfferingUpdateContainer';

export const DeleteOptionButton = ({ optionKey, optionLabel, offering }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const handler = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate(
          'Are you sure you want to delete option {name}?',
          {
            name: <b>{optionLabel}</b>,
          },
          formatJsxTemplate,
        ),
      );
    } catch {
      return;
    }
    const { [optionKey]: _, ...remaining } = offering.options.options;
    const newOptions = {
      order: offering.options.order.filter((item) => item !== optionKey),
      options: remaining,
    };
    try {
      await updateOfferingOptions(offering.uuid, {
        options: newOptions,
      });
      queryClient.setQueryData<OfferingData>(
        ['OfferingUpdateContainer', offering.uuid],
        (oldData) => ({
          ...oldData,
          offering: { ...oldData.offering, options: newOptions },
        }),
      );
      dispatch(showSuccess(translate('Option has been removed.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove option.')));
    }
  };
  return (
    <Button className="btn-sm btn-danger" onClick={handler}>
      {translate('Delete')}
    </Button>
  );
};
