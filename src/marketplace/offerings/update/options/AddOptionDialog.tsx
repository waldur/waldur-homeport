import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  updateOfferingOptions,
  updateOfferingResourceOptions,
} from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
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
          await updateOfferingOptions(props.resolve.offering.uuid, {
            options: newOptions,
          });
        } else if (props.resolve.type === 'resource_options') {
          await updateOfferingResourceOptions(props.resolve.offering.uuid, {
            resource_options: newOptions,
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
      <Modal.Header>
        <Modal.Title>{translate('Add option')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <OptionForm resourceType={props.resolve.type} />
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
