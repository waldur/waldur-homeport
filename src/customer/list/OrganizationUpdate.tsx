import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues, reduxForm } from 'redux-form';

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
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';

const PureOrganizationUpdate: FunctionComponent<any> = (props) => (
  <form
    onSubmit={props.handleSubmit(props.submitRequest)}
    style={{ marginTop: '20px' }}
  >
    <FormContainer submitting={props.submitting} floating={true}>
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
        style={{ height: '120px' }}
      />

      <StringField
        name="registration_code"
        label={translate('Registration code')}
      />

      <StringField
        name="agreement_number"
        label={translate('Agreement number')}
        maxLength={160}
      />

      <NumberField name="sponsor_number" label={translate('Sponsor number')} />

      <EmailField name="email" label={translate('Email')} maxLength={75} />

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
        unit="%"
        min={0}
        max={200}
      />

      <ImageField
        floating={false}
        label={translate('Organization image')}
        name="image"
        initialValue={props.initialValues.image}
      />

      <Form.Group>
        <div
          className="col-sm-8 offset-sm-2"
          style={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Update')}
          />
        </div>
      </Form.Group>
    </FormContainer>
  </form>
);

const mapStateToProps = (state, ownProps) => ({
  initialValues: getInitialValuesOfOrganizationUpdateForm(ownProps.customer),
  formData: getFormValues(ORGANIZATION_UPDATE_FORM_ID)(state),
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
