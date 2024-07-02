import { Button, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { NumberField, StringField, SubmitButton } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { FormSectionContainer } from '@waldur/form/FormSectionContainer';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { SelectCountryField } from '../list/SelectCountryField';

import { CustomerEditPanelProps } from './types';

const enhance = compose(
  connect((_: RootState, ownProps: CustomerEditPanelProps) => {
    const customer = ownProps.customer;
    const initialValues = {
      accounting_start_date: customer.accounting_start_date,
      bank_name: customer.bank_name,
      bank_account: customer.bank_account,
      vat_code: customer.vat_code,
      default_tax_percent: customer.default_tax_percent,
      country: customer.country
        ? {
            value: customer.country,
            label: customer.country_name,
          }
        : null,
    };
    return { initialValues };
  }),
  reduxForm({
    form: 'organizationBillingEdit',
  }),
);

type OwnProps = CustomerEditPanelProps & InjectedFormProps;

export const CustomerBillingPanel = enhance((props: OwnProps) => {
  return (
    <Card id="billing" className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Billing')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(props.callback)}>
          <FormSectionContainer
            label={translate('Details') + ':'}
            submitting={props.submitting}
            floating={true}
          >
            <DateField
              name="accounting_start_date"
              label={translate('Accounting start date')}
            />
            <StringField name="bank_name" label={translate('Bank name')} />
            <StringField
              name="bank_account"
              label={translate('Bank account')}
            />
          </FormSectionContainer>
          <FormSectionContainer
            label={translate('Tax') + ':'}
            submitting={props.submitting}
            floating={true}
          >
            <StringField name="vat_code" label={translate('VAT code')} />
            <NumberField
              name="default_tax_percent"
              label={translate('Tax percentage')}
              unit="%"
              min={0}
              max={200}
            />
            <SelectCountryField />
          </FormSectionContainer>

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
                  props.canUpdate
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
