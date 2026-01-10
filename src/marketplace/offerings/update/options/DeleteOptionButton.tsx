import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

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
        { forDeletion: true },
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
        await marketplaceProviderOfferingsUpdateOptions({
          path: { uuid: offering.uuid },
          body: {
            options: newOptions,
          },
        });
      } else if (type === 'resource_options') {
        await marketplaceProviderOfferingsUpdateResourceOptions({
          path: { uuid: offering.uuid },
          body: {
            resource_options: newOptions,
          },
        });
        if (refetch) await refetch();
      }
      dispatch(showSuccess(translate('Option has been removed.')));
    } catch (error) {
      dispatch(showErrorResponse(error, translate('Unable to remove option.')));
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
