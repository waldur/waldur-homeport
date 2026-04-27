import arrayMutators from 'final-form-arrays';
import { useCallback } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceProviderOfferingsUpdateOptions,
  marketplaceProviderOfferingsUpdateResourceOptions,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { formatOption } from '../../store/utils';

import { FIELD_TYPES } from './constants';
import { OptionForm } from './OptionForm';
import { validateOptionForm } from './validation';

export const AddOptionDialog = ({ resolve }) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
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
        dispatch(showSuccess(translate('Option has been added successfully.')));
        if (resolve.refetch) await resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add option.')));
      }
    },
    [dispatch, resolve],
  );

  return (
    <Form
      onSubmit={update}
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
