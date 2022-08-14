import { Button, Card, Form, Row } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { patch } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import {
  loadCountries,
  Option,
  SingleValue,
} from '@waldur/customer/create/CountryGroup';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  FormContainer,
  NumberField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { EmailField } from '@waldur/form/EmailField';
import { WindowedSelect } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getNativeNameVisible } from '@waldur/store/config';
import { RootState } from '@waldur/store/reducers';
import {
  getUser,
  isOwner as isOwnerSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

import { canManageCustomer } from '../create/selectors';

const CustomerErrorDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerErrorDialog" */ './CustomerErrorDialog'
    ),
  'CustomerErrorDialog',
);

const enhance = compose(
  connect((state: RootState) => {
    const customer = getCustomer(state);
    const initialValues = {
      name: customer.name,
      native_name: customer.native_name,
      abbreviation: customer.abbreviation,
      domain: customer.domain,
      registration_code: customer.registration_code,
      accounting_start_date: customer.accounting_start_date,
      agreement_number: customer.agreement_number,
      address: customer.address,
      email: customer.email,
      phone_number: customer.phone_number,
      vat_code: customer.vat_code,
      default_tax_percent: customer.default_tax_percent,
      access_subnets: customer.access_subnets,
      country: customer.country,
      postal: customer.postal,
      bank_name: customer.bank_name,
      bank_account: customer.bank_account,
    };
    return { initialValues };
  }),
  reduxForm({
    form: 'customerEdit',
  }),
);

const WindowedSelectField = ({ input: { value, onChange }, ...props }) => (
  <WindowedSelect value={value} onChange={onChange} {...props} />
);

const StaticField: React.FC<{
  labelClass?: string;
  controlClass?: string;
  label: string;
  value: string;
}> = (props) => (
  <Row>
    <Form.Label className={props.labelClass}>{props.label}</Form.Label>
    <div className={props.controlClass}>
      <p>{props.value}</p>
    </div>
  </Row>
);

StaticField.defaultProps = {
  labelClass: 'col-sm-3 col-md-4 col-lg-3',
  controlClass: 'col-sm-9 col-md-8',
};

export const CustomerDetailsPanel = enhance((props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const nativeNameVisible = useSelector(getNativeNameVisible);
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const ownerCanManage = useSelector(canManageCustomer);
  const canEditCustomer = user.is_staff || (isOwner && ownerCanManage);
  const { loading, value } = useAsync(loadCountries);
  const updateCustomer = (formData) => {
    if (canEditCustomer) {
      const { country, ...rest } = formData;
      return patch(`/customers/${customer.uuid}/`, {
        country: country?.value,
        ...rest,
      });
    } else {
      dispatch(
        openModalDialog(CustomerErrorDialog, {
          resolve: { customer, formData },
        }),
      );
    }
  };

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Organization details')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(updateCustomer)}>
          <FormContainer submitting={props.submitting} floating={true}>
            <StringField name="name" label={translate('Name')} />

            {nativeNameVisible ? (
              <StringField
                name="native_name"
                label={translate('Native name')}
              />
            ) : null}

            <StringField
              name="abbreviation"
              label={translate('Abbreviation')}
            />

            {isFeatureVisible('customer.show_domain') ? (
              <StringField
                name="domain"
                label={translate('Domain name')}
                description={translate('Home organization domain name')}
              />
            ) : null}

            <StringField
              name="registration_code"
              label={translate('Registry code')}
            />

            <DateField
              name="accounting_start_date"
              label={translate('Accounting start date')}
            />

            <StringField
              name="agreement_number"
              label={translate('Agreement number')}
            />

            <StringField name="address" label={translate('Address')} />

            <EmailField name="email" label={translate('Contact email')} />

            <StringField
              name="phone_number"
              label={translate('Contact phone')}
            />

            <StringField name="vat_code" label={translate('VAT code')} />

            <NumberField
              name="default_tax_percent"
              label={translate('VAT rate')}
              unit="%"
              max={50}
            />

            {ENV.plugins.WALDUR_CORE.ORGANIZATION_SUBNETS_VISIBLE ? (
              <StringField
                name="access_subnets"
                label={translate('Subnets')}
                description={translate(
                  'Subnets from where connection to self-service is allowed.',
                )}
              />
            ) : null}

            <Field
              name="country"
              floating={false}
              component={WindowedSelectField}
              components={{ Option, SingleValue }}
              placeholder={translate('Select country...')}
              getOptionLabel={(option) => option.display_name}
              getOptionValue={(option) => option.value}
              options={value || []}
              isLoading={loading}
              isClearable={true}
              noOptionsMessage={() => translate('No countries')}
            />

            <StringField name="postal" label={translate('Postal code')} />

            <StringField name="bank_name" label={translate('Bank name')} />

            <StringField
              name="bank_account"
              label={translate('Bank account')}
            />
          </FormContainer>

          {props.dirty && (
            <div className="pull-right">
              <Button
                variant="secondary"
                size="sm"
                className="me-2"
                onClick={props.reset}
              >
                {translate('Discard')}
              </Button>
              <SubmitButton
                className="btn btn-primary btn-sm me-2"
                submitting={props.submitting}
                label={
                  canEditCustomer
                    ? translate('Save changes')
                    : translate('Propose changes')
                }
              />
            </div>
          )}
        </form>
      </Card.Body>
    </Card>
  );
});
