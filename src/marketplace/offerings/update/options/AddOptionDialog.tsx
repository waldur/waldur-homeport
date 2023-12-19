import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingOptions } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatOption } from '../../store/utils';

import { OPTION_FORM_ID, FIELD_TYPES } from './constants';
import { OptionForm } from './OptionForm';

export const AddOptionDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: OPTION_FORM_ID,
  initialValues: {
    type: FIELD_TYPES[0],
  },
})((props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      const newOptions = {
        order: [...props.resolve.offering.options.order, formData.name],
        options: {
          ...props.resolve.offering.options.options,
          [formData.name]: formatOption(formData),
        },
      };
      try {
        await updateOfferingOptions(props.resolve.offering.uuid, {
          options: newOptions,
        });
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
      <Modal.Header>
        <Modal.Title>{translate('Add option')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <OptionForm />
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Create')}
        />
      </Modal.Footer>
    </form>
  );
});
