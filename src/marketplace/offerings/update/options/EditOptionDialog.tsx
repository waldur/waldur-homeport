import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
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

import { OPTION_FORM_ID, FIELD_TYPES } from './constants';
import { OptionForm } from './OptionForm';

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

export const EditOptionDialog = connect<{}, {}, { resolve: { option } }>(
  (_, ownProps) => ({
    initialValues: {
      ...ownProps.resolve.option,
      type: FIELD_TYPES.find(
        (fieldType) => fieldType.value === ownProps.resolve.option.type,
      ) || {
        value: ownProps.resolve.option.type,
        label: ownProps.resolve.option.type,
      },
      choices: Array.isArray(ownProps.resolve.option.choices)
        ? ownProps.resolve.option.choices.join(', ')
        : ownProps.resolve.option.choices,
      cascade_config: ownProps.resolve.option.cascade_config
        ? serializeCascadeConfig(ownProps.resolve.option.cascade_config)
        : undefined,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; option; type; refetch } }>({
    form: OPTION_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        const oldOptions = props.resolve.offering[props.resolve.type];
        const newOptions = {
          order: oldOptions.order,
          options: {
            ...oldOptions.options,
            [props.resolve.option.name]: formatOption(formData),
          },
        };
        try {
          if (props.resolve.type === 'options') {
            await marketplaceProviderOfferingsUpdateOptions({
              path: { uuid: props.resolve.offering.uuid },
              body: {
                options: newOptions,
              },
            });
          } else if (props.resolve.type === 'resource_options') {
            await marketplaceProviderOfferingsUpdateResourceOptions({
              path: { uuid: props.resolve.offering.uuid },
              body: {
                resource_options: newOptions,
              },
            });
          }
          dispatch(
            showSuccess(translate('Option has been updated successfully.')),
          );
          if (props.resolve.refetch) await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update an option.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={translate('Edit option')}
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Save')}
            />
          }
          closeButton
        >
          <OptionForm
            resourceType={props.resolve.type}
            offering={props.resolve.offering}
          />
        </ModalDialog>
      </form>
    );
  }),
);
