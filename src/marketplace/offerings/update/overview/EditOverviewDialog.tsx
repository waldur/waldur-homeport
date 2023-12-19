import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { WysiwygEditor } from '@waldur/core/WysiwygEditor';
import {
  StringField,
  FormContainer,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingOverview } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';
import { pickOverview } from './utils';

export const EditOverviewDialog = connect(
  (_, ownProps: { resolve: EditOfferingProps }) => ({
    initialValues: {
      value: ownProps.resolve.offering[ownProps.resolve.attribute.key],
    },
  }),
)(
  reduxForm<{}, { resolve: EditOfferingProps }>({
    form: OVERVIEW_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingOverview(props.resolve.offering.uuid, {
            ...pickOverview(props.resolve.offering),
            [props.resolve.attribute.key]: formData.value,
          });
          dispatch(
            showSuccess(translate('Offering has been updated successfully.')),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to update offering.')),
          );
        }
      },
      [dispatch],
    );
    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{props.resolve.attribute.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props}>
            {props.resolve.attribute.type === 'html' ? (
              <WysiwygEditor name="value" />
            ) : props.resolve.attribute.type === 'text' ? (
              <TextField name="value" />
            ) : (
              <StringField
                name="value"
                maxLength={props.resolve.attribute.maxLength}
              />
            )}
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
