import arrayMutators from 'final-form-arrays';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { formatOption } from '../../store/utils';

import { FIELD_TYPES } from './constants';
import { OptionForm } from './OptionForm';
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
    <Form
      onSubmit={(values) => addMutation.mutateAsync(values)}
      validate={validateOptionForm}
      initialValues={{
        type: FIELD_TYPES[0],
      }}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add option')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Create')}
              />
            }
          >
            <OptionForm
              resourceType={resolve.type}
              offering={resolve.offering}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
