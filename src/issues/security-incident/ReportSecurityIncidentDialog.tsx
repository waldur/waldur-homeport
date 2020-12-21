import { FunctionComponent } from 'react';
import { ControlLabel, FormGroup } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { FileField } from '@waldur/issues/create/FileField';
import {
  ProjectGroup,
  ResourceGroup,
} from '@waldur/issues/create/IssueQuickCreate';
import { REPORT_SECURITY_INCIDENT_FORM_ID } from '@waldur/issues/security-incident/constants';
import { reportIncident } from '@waldur/issues/security-incident/store/actions';
import {
  getSecurityIncidentTypeOptions,
  reportSecurityIncidentProjectSelector,
} from '@waldur/issues/security-incident/utils';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { getCustomer } from '@waldur/workspace/selectors';

const PureReportSecurityIncidentDialog: FunctionComponent<any> = (props) => (
  <form onSubmit={props.handleSubmit(props.submitRequest)}>
    <ModalDialog
      title={translate('Report security incident')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Report')}
          />
        </>
      }
    >
      <FormContainer submitting={props.submitting} clearOnUnmount={true}>
        <DateField
          name="date"
          label={translate('Date and time of incident')}
          required
        />

        <SelectField
          label={translate('Type of incident')}
          name="type"
          placeholder={translate('Select incident type')}
          required={true}
          options={getSecurityIncidentTypeOptions()}
          isClearable={true}
          validate={required}
        />

        <Field
          name="summary"
          component={InputField}
          required={true}
          label={translate('Title')}
          maxLength={120}
        />

        <TextField
          name="description"
          label={translate('Description')}
          maxLength={160}
        />

        <ProjectGroup
          disabled={props.submitting}
          customer={useSelector(getCustomer)}
          formId={REPORT_SECURITY_INCIDENT_FORM_ID}
        />

        <ResourceGroup
          disabled={props.submitting}
          project={useSelector(reportSecurityIncidentProjectSelector)}
          formId={REPORT_SECURITY_INCIDENT_FORM_ID}
        />

        <FormGroup>
          <ControlLabel>{translate('Attachments')}</ControlLabel>
          <Field
            name="files"
            component={FileField}
            disabled={props.submitting}
          />
        </FormGroup>
      </FormContainer>
    </ModalDialog>
  </form>
);

const mapDispatchToProps = (dispatch) => ({
  submitRequest: (formData) => dispatch(reportIncident(formData)),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: REPORT_SECURITY_INCIDENT_FORM_ID,
  }),
);

export const ReportSecurityIncidentDialog = enhance(
  PureReportSecurityIncidentDialog,
);
