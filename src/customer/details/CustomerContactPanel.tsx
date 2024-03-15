import { Button, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { StringField, SubmitButton, TextField } from '@waldur/form';
import { EmailField } from '@waldur/form/EmailField';
import { FormSectionContainer } from '@waldur/form/FormSectionContainer';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { CustomerEditPanelProps } from './types';

const enhance = compose(
  connect((_: RootState, ownProps: CustomerEditPanelProps) => {
    const customer = ownProps.customer;
    const initialValues = {
      email: customer.email,
      phone_number: customer.phone_number,
      contact_details: customer.contact_details,
      homepage: customer.homepage,
    };
    return { initialValues };
  }),
  reduxForm({
    form: 'organizationContactEdit',
  }),
);

type OwnProps = CustomerEditPanelProps & InjectedFormProps;

export const CustomerContactPanel = enhance((props: OwnProps) => {
  return (
    <Card id="contact" className="mt-5">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Contact')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(props.callback)}>
          <FormSectionContainer
            label={translate('Contact') + ':'}
            submitting={props.submitting}
            floating={true}
          >
            <EmailField name="email" label={translate('Email')} />
            <StringField
              name="phone_number"
              label={translate('Phone number')}
            />
            <TextField
              name="contact_details"
              label={translate('Contact details')}
            />
            <StringField name="homepage" label={translate('Homepage')} />
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
