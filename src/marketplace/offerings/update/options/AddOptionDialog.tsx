import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatOption } from '../../store/utils';

import { FIELD_TYPES } from './constants';
import { OptionWizard } from './OptionWizard';
import { validateOptionForm } from './validation';

export const AddOptionDialog = ({ resolve }) => {
  const addMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      const oldOptions = resolve.offering[resolve.type];
      const newOptions = {
        order: oldOptions?.order
          ? [...oldOptions.order, formData.name]
          : [formData.name],
        options: {
          ...oldOptions?.options,
          [formData.name]: formatOption(formData),
        },
      };

      if (resolve.type === 'options') {
        await marketplaceProviderOfferingsUpdateOptions({
          path: { uuid: resolve.offering.uuid },
          body: {
            options: newOptions,
          },
        });
      } else if (resolve.type === 'resource_options') {
        await marketplaceProviderOfferingsUpdateResourceOptions({
          path: { uuid: resolve.offering.uuid },
          body: {
            resource_options: newOptions,
          },
        });
      }
    },
    successMessage: translate('Option has been added successfully.'),
    errorMessage: translate('Unable to add option.'),
    refetch: resolve.refetch,
  });

  return (
    <OptionWizard
      title={translate('Add option')}
      submitLabel={translate('Create')}
      initialValues={{ type: FIELD_TYPES[0] }}
      validate={(values) =>
        validateOptionForm(values, { options: resolve.offering[resolve.type] })
      }
      onSubmit={(values) => addMutation.mutateAsync(values)}
      resourceType={resolve.type}
      offering={resolve.offering}
    />
  );
};
