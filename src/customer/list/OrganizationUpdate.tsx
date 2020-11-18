import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { ORGANIZATION_UPDATE_FORM_ID } from '@waldur/customer/list/constants';
import { SelectCountryField } from '@waldur/customer/list/SelectCountryField';
import { SelectOrganizationDivisionField } from '@waldur/customer/list/SelectOrganizationDivisionField';
import { updateOrganization } from '@waldur/customer/list/store/actions';
import { getInitialValuesOfOrganizationUpdateForm } from '@waldur/customer/list/utils';
import {
  FormContainer,
  NumberField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { translate } from '@waldur/i18n';

const PureOrganizationUpdate = (props) => (
  <form
    onSubmit={props.handleSubmit(props.submitRequest)}
    className="form-horizontal"
    style={{ marginTop: '20px' }}
  >
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-2"
      controlClass="col-sm-8"
    >
      <StringField
        name="name"
        label={translate('Name')}
        required={true}
        validate={required}
        maxLength={150}
      />

      <StringField
        name="uuid"
        label={translate('UUID')}
        required={true}
        validate={required}
        disabled={true}
      />

      <StringField
        name="abbreviation"
        label={translate('Abbreviation')}
        maxLength={12}
      />

      <SelectOrganizationDivisionField />

      <TextField
        name="contact_details"
        label={translate('Contact details')}
        rows={2}
      />

      <StringField
        name="registration_code"
        label={translate('Registration code')}
      />

      <NumberField
        name="agreement_number"
        label={translate('Agreement number')}
      />

      <NumberField name="sponsor_number" label={translate('Sponsor number')} />

      <EmailField name="email" label={translate('E-mail')} maxLength={75} />

      <StringField
        name="phone_number"
        label={translate('Phone number')}
        maxLength={255}
      />

      <TextField name="access_subnets" label={translate('Access subnets')} />

      <StringField
        name="homepage"
        label={translate('Homepage')}
        maxLength={255}
      />

      <SelectCountryField />

      <StringField name="vat_code" label={translate('VAT code')} />

      <NumberField
        name="default_tax_percent"
        label={translate('Tax percent')}
      />

      <div className="form-group">
        <div
          className="col-sm-8 col-sm-offset-2"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Update')}
          />
        </div>
      </div>
    </FormContainer>
  </form>
);

const mapStateToProps = (_state, ownProps) => ({
  initialValues: getInitialValuesOfOrganizationUpdateForm(ownProps.customer),
});

const mapDispatchToProps = (dispatch) => ({
  submitRequest: (formData) =>
    dispatch(
      updateOrganization({
        ...formData,
        country: formData.country?.value,
        division: formData.division?.url,
      }),
    ),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: ORGANIZATION_UPDATE_FORM_ID,
  }),
);

export const OrganizationUpdate = enhance(PureOrganizationUpdate);
