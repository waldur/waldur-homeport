import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOfferingOptions } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatOption } from '../../store/utils';

import { OPTION_FORM_ID, FIELD_TYPES } from './constants';
import { OptionForm } from './OptionForm';

export const EditOptionDialog = connect<{}, {}, { resolve: { option } }>(
  (_, ownProps) => ({
    initialValues: {
      ...ownProps.resolve.option,
      type: FIELD_TYPES.find(
        (fieldType) => fieldType.value === ownProps.resolve.option.type,
      ),
      choices: Array.isArray(ownProps.resolve.option.choices)
        ? ownProps.resolve.option.choices.join(', ')
        : ownProps.resolve.option.choices,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; option; refetch } }>({
    form: OPTION_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        const newOptions = {
          order: props.resolve.offering.options.order,
          options: {
            ...props.resolve.offering.options.options,
            [props.resolve.option.name]: formatOption(formData),
          },
        };
        try {
          await updateProviderOfferingOptions(props.resolve.offering.uuid, {
            options: newOptions,
          });
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
        <Modal.Header>
          <Modal.Title>{translate('Edit option')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OptionForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
