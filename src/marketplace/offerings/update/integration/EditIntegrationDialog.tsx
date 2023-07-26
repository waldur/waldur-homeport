import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FormSection, reduxForm, Field } from 'redux-form';

import { patch } from '@waldur/core/api';
import { FormContainer, StringField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import {
  allowToUpdateService,
  getPluginOptionsForm,
  getSecretOptionsForm,
  showBackendId,
} from '@waldur/marketplace/common/registry';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getServiceSettingsForm } from '@waldur/providers/registry';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_INTEGRATION_FORM_ID } from './constants';

export const EditIntegrationDialog = connect(
  (_, ownProps: { resolve: { offering; provider } }) => ({
    initialValues: {
      service_settings: ownProps.resolve.provider?.options,
      secret_options: ownProps.resolve.offering.secret_options,
      plugin_options: ownProps.resolve.offering.plugin_options,
      backend_id: ownProps.resolve.offering.backend_id,
    },
  }),
)(
  reduxForm<{}, { resolve: { offering; provider; refetch } }>({
    form: EDIT_INTEGRATION_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          if (props.resolve.provider?.options !== formData.service_settings) {
            await patch(props.resolve.offering.scope, {
              options: formData.service_settings,
            });
          }
          await updateProviderOffering(props.resolve.offering.uuid, formData);
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

    const ServiceSettingsForm = getServiceSettingsForm(
      props.resolve.offering.type,
    );
    const SecretOptionsForm = getSecretOptionsForm(props.resolve.offering.type);
    const PluginOptionsForm = getPluginOptionsForm(props.resolve.offering.type);

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Update integration options')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormContainer {...props}>
            {allowToUpdateService(props.resolve.offering.type) &&
            props.resolve.provider &&
            ServiceSettingsForm ? (
              <FormSection name="service_settings">
                <ServiceSettingsForm />
              </FormSection>
            ) : null}
            {SecretOptionsForm && (
              <FormSection name="secret_options">
                <SecretOptionsForm offering={props.resolve.offering} />
              </FormSection>
            )}
            {showBackendId(props.resolve.offering.type) && (
              <StringField name="backend_id" label={translate('Backend ID')} />
            )}
            <FormSection name="plugin_options">
              {PluginOptionsForm && (
                <>
                  <Field
                    name="auto_approve_in_service_provider_projects"
                    component={AwesomeCheckboxField}
                    className="mt-3"
                    label={translate(
                      'Auto approve in service provider projects',
                    )}
                  />
                  <PluginOptionsForm />
                </>
              )}
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
