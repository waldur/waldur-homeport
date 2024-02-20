import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FormSection, reduxForm, Field } from 'redux-form';

import {
  FormContainer,
  NumberField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { updateOfferingIntegration } from '@waldur/marketplace/common/api';
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
  (_, ownProps: { resolve: { offering } }) => ({
    initialValues: {
      service_attributes: ownProps.resolve.offering.service_attributes,
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
          await updateOfferingIntegration(
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
            ServiceSettingsForm ? (
              <FormSection name="service_attributes">
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
          </FormContainer>
          <FormSection name="plugin_options">
            {PluginOptionsForm && (
              <FormContainer {...props}>
                <Field
                  name="auto_approve_in_service_provider_projects"
                  component={AwesomeCheckboxField}
                  className="mt-3"
                  label={translate('Auto approve in service provider projects')}
                />
                <Field
                  name="is_resource_termination_date_required"
                  component={AwesomeCheckboxField}
                  className="mt-3"
                  label={translate('Resource termination date is required')}
                />
                <Field
                  name="default_resource_termination_offset_in_days"
                  component={NumberField}
                  label={translate(
                    'Default resource termination offset in days',
                  )}
                  className="mt-3"
                />
                <Field
                  name="max_resource_termination_offset_in_days"
                  component={NumberField}
                  className="mt-3"
                  label={translate(
                    'Maximal resource termination offset in days',
                  )}
                />
                <Field
                  name="latest_date_for_resource_termination"
                  component={DateField}
                  label={translate('Latest date for resource termination')}
                  className="mt-3"
                />
                <PluginOptionsForm />
              </FormContainer>
            )}
          </FormSection>
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
