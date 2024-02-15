import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FormSection, reduxForm } from 'redux-form';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingIntegration } from '@waldur/marketplace/common/api';
import { UserLexisLinkPluginOptionsForm } from '@waldur/marketplace/UserLexisLInkPluginOptionsForm';
import { UserLexisLinkSecretOptionsForm } from '@waldur/marketplace/UserLexisLInkSecretOptionsForm';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_LEXIS_LINK_INTEGRATION_FORM_ID } from './constants';

export const EditLexisLinkIntegrationDialog = connect(
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      secret_options: ownProps.resolve.offering.secret_options,
      plugin_options: ownProps.resolve.offering.plugin_options,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; provider; refetch } }>({
    form: EDIT_LEXIS_LINK_INTEGRATION_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await updateOfferingIntegration(
            props.resolve.offering.uuid,
            formData,
          );
          dispatch(
            showSuccess(
              translate(
                'Offering LEXIS link options have been updated successfully.',
              ),
            ),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to update offering LEXIS link options.'),
            ),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Update LEXIS link options')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props}>
            <FormSection name="secret_options">
              <UserLexisLinkSecretOptionsForm />
            </FormSection>
            <FormSection name="plugin_options">
              <UserLexisLinkPluginOptionsForm />
            </FormSection>
          </FormContainer>
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            submitting={props.submitting}
            label={translate('Save')}
          />
          <CloseDialogButton />
        </Modal.Footer>
      </form>
    );
  }),
);
