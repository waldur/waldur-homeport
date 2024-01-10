import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import {
  updateOfferingOptions,
  updateOfferingResourceOptions,
} from '@waldur/marketplace/common/api';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OfferingSectionProps } from '../types';

export const DeleteOptionButton: FC<
  OfferingSectionProps & {
    optionKey: string;
    optionLabel: string;
    type: string;
  }
> = ({ optionKey, optionLabel, offering, type, refetch }) => {
  const dispatch = useDispatch();
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
    const oldOptions = offering[type];
    const { [optionKey]: _, ...remaining } = oldOptions.options;
    const newOptions = {
      order: oldOptions.order.filter((item) => item !== optionKey),
      options: remaining,
    };
    try {
      if (type === 'options') {
        await updateOfferingOptions(offering.uuid, {
          options: newOptions,
        });
      } else if (type === 'resource_options') {
        await updateOfferingResourceOptions(offering.uuid, {
          resource_options: newOptions,
        });
        if (refetch) await refetch();
      }
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
