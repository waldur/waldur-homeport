import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import {
  FormContainer,
  NumberField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { ENV } from '../../configs/default';
import { sendForm } from '../../core/api';
import { closeModalDialog } from '../../modal/actions';
import { showErrorResponse, showSuccess } from '../../store/notify';

const saveConfig = (values) =>
  sendForm('POST', `${ENV.apiEndpoint}api/override-settings/`, values);

const AdministrationServiceDeskUpdateDialog: FunctionComponent<any> = (
  props,
) => {
  const dispatch = useDispatch();
  const callback = async (formData) => {
    try {
      await saveConfig(formData);
      dispatch(showSuccess('Configurations have been updated'));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update the configurations.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={translate('Update service desk settings')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Update')}
            />
          </>
        }
      >
        <FormContainer
          submitting={false}
          clearOnUnmount={false}
          floating={true}
        >
          {props.serviceDeskProvider === 'atlassian' && (
            <div className="mb-2">
              <Field
                name="ATLASSIAN_USE_OLD_API"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Use old API')}
              />

              <Field
                name="ATLASSIAN_USE_TEENAGE_API"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Use teenage API')}
              />

              <Field
                name="ATLASSIAN_USE_AUTOMATIC_REQUEST_MAPPING"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Use automatic request mapping')}
              />

              <Field
                name="ATLASSIAN_MAP_WALDUR_USERS_TO_SERVICEDESK_AGENTS"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Map waldur users to service desk agents')}
              />
              <Field
                name="ATLASSIAN_VERIFY_SSL"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Verify SSL')}
              />
              <Field
                name="ATLASSIAN_PULL_PRIORITIES"
                component={AwesomeCheckboxField}
                className="mt-3"
                label={translate('Pull priorities')}
              />
            </div>
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_API_URL"
              label={translate('API URL')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_USERNAME"
              label={translate('Username')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <Field
              name="ATLASSIAN_PASSWORD"
              type="password"
              label={translate('Password')}
              maxLength={150}
              component={StringField}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <EmailField
              name="ATLASSIAN_EMAIL"
              label={translate('Email')}
              maxLength={75}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <Field
              name="ATLASSIAN_TOKEN"
              type="password"
              label={translate('Token')}
              maxLength={150}
              component={StringField}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_PROJECT_ID"
              label={translate('Project ID')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_DEFAULT_OFFERING_ISSUE_TYPE"
              label={translate('Default offering issue type')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_EXCLUDED_ATTACHMENT_TYPES"
              label={translate('List of attachment types')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <TextField
              name="ATLASSIAN_ISSUE_TYPES"
              label={translate('Issue types')}
              placeholder={translate('Comma seperated issue types')}
              rows={2}
              style={{ height: '120px' }}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_AFFECTED_RESOURCE_FIELD"
              label={translate('Affected resource')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_DESCRIPTION_TEMPLATE"
              label={translate('Description template')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_SUMMARY_TEMPLATE"
              label={translate('Summary template')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_IMPACT_FIELD"
              label={translate('Impact')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_ORGANISATION_FIELD"
              label={translate('Organisation')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_RESOLUTION_SLA_FIELD"
              label={translate('Resolution SLA')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_PROJECT_FIELD"
              label={translate('Project')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_REPORTER_FIELD"
              label={translate('Reporter')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_CALLER_FIELD"
              label={translate('Caller')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_SLA_FIELD"
              label={translate('SLA')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_LINKED_ISSUE_TYPE"
              label={translate('Type of linked issue')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_SATISFACTION_FIELD"
              label={translate('Satisfaction')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_REQUEST_FEEDBACK_FIELD"
              label={translate('Issue request feedback')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'atlassian' && (
            <StringField
              name="ATLASSIAN_TEMPLATE_FIELD"
              label={translate('Template field')}
              maxLength={150}
            />
          )}

          {props.serviceDeskProvider === 'zammad' && (
            <StringField
              name="ZAMMAD_API_URL"
              label={translate('API URL')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <Field
              name="ZAMMAD_TOKEN"
              type="password"
              label={translate('Token')}
              maxLength={150}
              component={StringField}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <StringField
              name="ZAMMAD_GROUP"
              label={translate('Zammad group')}
              placeholder={translate(
                'The name of the group to which the ticket will be added. ',
              )}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <StringField
              name="ZAMMAD_ARTICLE_TYPE"
              label={translate('Type of a comment.')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <StringField
              name="ZAMMAD_COMMENT_MARKER"
              label={translate('Marker for comment')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <StringField
              name="ZAMMAD_COMMENT_PREFIX"
              label={translate('Comment prefix')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'zammad' && (
            <NumberField
              name="ZAMMAD_COMMENT_COOLDOWN_DURATION"
              label={translate('Comment cooldown duration')}
              min={1}
            />
          )}
          {props.serviceDeskProvider === 'smax' && (
            <StringField
              name="SMAX_API_URL"
              label={translate('API URL')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'smax' && (
            <StringField
              name="SMAX_TENANT_ID"
              label={translate('Tenant ID')}
              maxLength={150}
            />
          )}
          {props.serviceDeskProvider === 'smax' && (
            <StringField
              name="SMAX_LOGIN"
              label={translate('Login')}
              maxLength={150}
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const enhance = compose(
  reduxForm({
    form: 'Editprops.serviceDeskProvider',
  }),
);

export const AdministrationServiceDeskUpdateDialogContainer = enhance(
  AdministrationServiceDeskUpdateDialog,
);
