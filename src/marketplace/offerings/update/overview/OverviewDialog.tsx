import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { WysiwygEditor } from '@waldur/core/WysiwygEditor';
import { StringField, FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOfferingOverview } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { OVERVIEW_FORM_ID } from './constants';

export const OverviewDialog = connect(
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      name: ownProps.resolve.offering.name,
      description: ownProps.resolve.offering.description,
      full_description: ownProps.resolve.offering.full_description,
      privacy_policy_link: ownProps.resolve.offering.privacy_policy_link,
      terms_of_service: ownProps.resolve.offering.terms_of_service,
      terms_of_service_link: ownProps.resolve.offering.terms_of_service_link,
      access_url: ownProps.resolve.offering.access_url,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; refetch } }>({
    form: OVERVIEW_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateProviderOfferingOverview(
            props.resolve.offering.uuid,
            formData,
          );
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
          <Modal.Title>{translate('Update overview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props}>
            <StringField
              name="name"
              label={translate('Name')}
              required={true}
              validate={required}
              maxLength={150}
            />
            <WysiwygEditor
              name="description"
              label={translate('Description')}
            />
            <WysiwygEditor
              name="full_description"
              label={translate('Full description')}
            />
            <StringField
              name="privacy_policy_link"
              label={translate('Privacy policy link')}
              maxLength={200}
            />
            <WysiwygEditor
              name="terms_of_service"
              label={translate('Terms of service')}
            />
            <StringField
              name="terms_of_service_link"
              label={translate('Terms of service link')}
              maxLength={200}
            />
            <StringField
              name="access_url"
              label={translate('Access console link')}
              maxLength={200}
            />
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
