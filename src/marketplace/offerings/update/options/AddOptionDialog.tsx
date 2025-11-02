import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
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

export const AddOptionDialog = reduxForm<
  {},
  { resolve: { offering; refetch; type } }
>({
  form: OPTION_FORM_ID,
  initialValues: {
    type: FIELD_TYPES[0],
  },
})((props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      const oldOptions = props.resolve.offering[props.resolve.type];
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
        dispatch(showSuccess(translate('Option has been added successfully.')));
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error, translate('Unable to add option.')));
      }
    },
    [dispatch],
  );

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <ModalDialog
        title={translate('Add option')}
        footer={
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Create')}
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
});
