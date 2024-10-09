import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import {
  FieldError,
  FormContainer,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import {
  offeringsAutocomplete,
  organizationAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { CustomerCreditFormData } from './types';

interface CreditFormDialogProps {
  formId: string;
  onSubmit(formData: CustomerCreditFormData): void;
  initialValues: any;
}

export const CreditFormDialog = connect(
  (_, ownProps: CreditFormDialogProps) => ({
    form: ownProps.formId,
    initialValues: ownProps.initialValues,
  }),
)(
  reduxForm<CustomerCreditFormData, CreditFormDialogProps>({
    destroyOnUnmount: true,
  })((props) => {
    return (
      <form onSubmit={props.handleSubmit(props.onSubmit)}>
        <MetronicModalDialog
          title={
            props.initialValues
              ? translate('Edit credit')
              : translate('Create credit')
          }
          footer={
            <>
              <CloseDialogButton className="flex-equal min-w-125px" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={
                  props.initialValues ? translate('Edit') : translate('Create')
                }
                className="btn btn-primary flex-equal min-w-125px"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting} className="size-lg">
            <AsyncSelectField
              name="customer"
              label={translate('Select organization')}
              validate={required}
              required
              placeholder={translate('Search and select organization') + '...'}
              loadOptions={(query, prevOptions, { page }) =>
                organizationAutocomplete(query, prevOptions, page, {
                  field: ['name', 'uuid', 'url'],
                })
              }
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              noOptionsMessage={() => translate('No organizations')}
            />
            <AsyncSelectField
              name="offerings"
              label={translate('Select offering(s)')}
              validate={required}
              required
              placeholder={translate('Select offerings') + '...'}
              loadOptions={(query, prevOptions, { page }) =>
                offeringsAutocomplete(
                  { name: query, billable: true },
                  prevOptions,
                  page,
                )
              }
              isMulti
              getOptionValue={(option) => option.uuid}
              getOptionLabel={(option) =>
                option.category_title
                  ? `${option.category_title} / ${option.name}`
                  : option.name
              }
              noOptionsMessage={() => translate('No offerings')}
            />
            <NumberField
              label={translate('Value')}
              name="value"
              placeholder={translate('Enter a value')}
              validate={required}
              required
            />
            <NumberField
              label={translate('Minimal consumption')}
              name="minimal_consumption"
              placeholder={translate('Enter a value')}
            />
            <DateField name="end_date" label={translate('Credit end date')} />
            <Form.Group>
              <FieldError error={props.error} />
            </Form.Group>
          </FormContainer>
        </MetronicModalDialog>
      </form>
    );
  }),
);
