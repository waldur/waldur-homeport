import arrayMutators from 'final-form-arrays';
import { useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
  const dispatch = useDispatch();

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
    [resolve.option],
  );

  const update = useCallback(
    async (formData) => {
      const oldOptions = resolve.offering[resolve.type];
      const newOptions = {
        order: oldOptions.order,
        options: {
          ...oldOptions.options,
          [resolve.option.name]: formatOption(formData),
        },
      };
      try {
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
        dispatch(
          showSuccess(translate('Option has been updated successfully.')),
        );
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update an option.')),
        );
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={update}
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
