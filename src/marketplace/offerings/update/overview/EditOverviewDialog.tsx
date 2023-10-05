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
import { updateProviderOfferingOverview } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OVERVIEW_FORM_ID } from './constants';
import { EditOfferingProps } from './types';

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
          await updateProviderOfferingOverview(props.resolve.offering.uuid, {
            name: props.resolve.offering.name,
            description: props.resolve.offering.description,
            full_description: props.resolve.offering.full_description,
            privacy_policy_link: props.resolve.offering.privacy_policy_link,
            terms_of_service: props.resolve.offering.terms_of_service,
            terms_of_service_link: props.resolve.offering.terms_of_service_link,
            access_url: props.resolve.offering.access_url,
            getting_started: props.resolve.offering.getting_started,
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
