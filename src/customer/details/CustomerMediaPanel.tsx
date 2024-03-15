import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { FormSectionContainer } from '@waldur/form/FormSectionContainer';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { CustomerEditPanelProps } from './types';

const enhance = compose(
  connect((_: RootState, ownProps: CustomerEditPanelProps) => {
    const customer = ownProps.customer;
    const initialValues = {
      image: customer.image,
    };
    return { initialValues };
  }),
  reduxForm({
    form: 'organizationMediaEdit',
  }),
);

type OwnProps = CustomerEditPanelProps & InjectedFormProps<any>;

export const CustomerMediaPanel = enhance((props: OwnProps) => {
  return (
    <Card id="media" className="mt-5">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Media')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={props.handleSubmit(props.callback)}>
          <FormSectionContainer
            label={translate('Organization logo') + ':'}
            submitting={props.submitting}
          >
            <ImageField
              name="image"
              initialValue={props.initialValues.image}
              hideLabel
            />
          </FormSectionContainer>

          {props.dirty && (
            <div className="pull-right">
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
