import { FC } from 'react';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { formatDependentOptionsError, getDependentOptions } from './validation';

export const DeleteOptionAction: FC<{
  offering;
  optionKey: string;
  optionLabel: string;
  type: string;
  refetch;
}> = ({ optionKey, optionLabel, offering, type, refetch }) => {
  const dependents = getDependentOptions(offering[type], optionKey);
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
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || dependents.length > 0}
      tooltip={
        isPending
          ? translate('Processing')
          : dependents.length > 0
            ? formatDependentOptionsError(dependents)
            : undefined
      }
    />
  );
};
