import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatSchedules } from '../../store/utils';

import { EDIT_SCHEDULES_FORM_ID } from './constants';
import { OfferingScheduler } from './OfferingScheduler';

export const EditSchedulesDialog = connect(
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      schedules: ownProps.resolve.offering.attributes?.schedules,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; refetch } }>({
    form: EDIT_SCHEDULES_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateProviderOffering(props.resolve.offering.uuid, {
            attributes: {
              ...props.resolve.offering.attributes,
              ...formatSchedules(formData),
            },
          });
          dispatch(
            showSuccess(translate('Schedules have been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update schedules.')),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Update schedule')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props}>
            <FieldArray name="schedules" component={OfferingScheduler} />
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            submitting={props.submitting}
            label={translate('Update')}
          />
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
