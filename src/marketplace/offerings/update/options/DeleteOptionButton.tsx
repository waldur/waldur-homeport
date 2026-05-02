import { FC } from 'react';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CompactActionButton } from '@/table/CompactActionButton';

import { OfferingSectionProps } from '../types';

export const DeleteOptionButton: FC<
  OfferingSectionProps & {
    optionKey: string;
    optionLabel: string;
    type: string;
  }
> = ({ optionKey, optionLabel, offering, type, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      const oldOptions = offering[type];
      const { [optionKey]: _, ...remaining } = oldOptions.options;
      const newOptions = {
        order: oldOptions.order.filter((item) => item !== optionKey),
        options: remaining,
      };
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
      }
    },
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete option {name}?',
        {
          name: <b>{optionLabel}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Option has been removed.'),
    errorMessage: translate('Unable to remove option.'),
    refetch,
  });
  return (
    <CompactActionButton
      variant="danger"
      action={mutate}
      disabled={isPending}
      title={translate('Delete')}
      tooltip={isPending ? translate('Processing') : undefined}
    />
  );
};
