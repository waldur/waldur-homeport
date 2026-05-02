import arrayMutators from 'final-form-arrays';
import { useMemo } from 'react';
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

const serializeCascadeConfig = (cascadeConfig) => {
  if (!cascadeConfig?.steps) return cascadeConfig;

  return {
    ...cascadeConfig,
    steps: cascadeConfig.steps.map((step) => ({
      ...step,
      choices:
        typeof step.choices === 'object'
          ? JSON.stringify(step.choices)
          : step.choices,
      choices_map:
        typeof step.choices_map === 'object'
          ? JSON.stringify(step.choices_map)
          : step.choices_map,
    })),
  };
};

export const EditOptionDialog = ({ resolve }) => {
  const initialValues = useMemo(
    () => ({
      ...resolve.option,
      type: FIELD_TYPES.find(
        (fieldType) => fieldType.value === resolve.option.type,
      ) || {
        value: resolve.option.type,
        label: resolve.option.type,
      },
      choices: Array.isArray(resolve.option.choices)
        ? resolve.option.choices.join(', ')
        : resolve.option.choices,
      cascade_config: resolve.option.cascade_config
        ? serializeCascadeConfig(resolve.option.cascade_config)
        : undefined,
    }),
    [],
  );

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const oldOptions = resolve.offering[resolve.type];
      const newOptions = {
        order: oldOptions.order,
        options: {
          ...oldOptions.options,
          [resolve.option.name]: formatOption(formData),
        },
      };
      if (resolve.type === 'options') {
        return marketplaceProviderOfferingsUpdateOptions({
          path: { uuid: resolve.offering.uuid },
          body: {
            options: newOptions,
          },
        });
      } else if (resolve.type === 'resource_options') {
        return marketplaceProviderOfferingsUpdateResourceOptions({
          path: { uuid: resolve.offering.uuid },
          body: {
            resource_options: newOptions,
          },
        });
      }
      return Promise.reject(new Error('Unknown option type'));
    },
    successMessage: translate('Option has been updated successfully.'),
    errorMessage: translate('Unable to update an option.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      validate={validateOptionForm}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit option')}
            footer={
              <SubmitButton
                disabled={invalid}
                submitting={submitting}
                label={translate('Save')}
              />
            }
            closeButton
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
