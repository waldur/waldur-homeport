import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { Form, FormControl } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { CustomRadioButton } from '@waldur/core/CustomRadioButton';
import { parseDate } from '@waldur/core/dateUtils';
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

const getStartOfNextMonth = () =>
  DateTime.now().plus({ months: 1 }).startOf('month');

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
    const isEdit = Boolean(props.initialValues);

    const formValues = (useSelector(getFormValues(props.formId)) ||
      {}) as CustomerCreditFormData;

    const needToRecalculateMinimalConsumption =
      !isEdit ||
      (formValues &&
        (formValues.end_date !== props.initialValues?.end_date ||
          Number(formValues.value) !== Number(props.initialValues?.value)));

    useEffect(() => {
      if (!props.initialValues?.minimal_consumption_logic) {
        props.change('minimal_consumption_logic', 'fixed');
      }
    }, []);

    useEffect(() => {
      if (formValues.minimal_consumption_logic === 'linear') {
        props.change('minimal_consumption', null);
        if (
          formValues.end_date &&
          parseDate(formValues.end_date) < getStartOfNextMonth()
        ) {
          props.change('end_date', null);
        }
      } else if (isEdit) {
        props.change(
          'minimal_consumption',
          props.initialValues?.minimal_consumption,
        );
      }
    }, [formValues.minimal_consumption_logic]);

    return (
      <form onSubmit={props.handleSubmit(props.onSubmit)}>
        <MetronicModalDialog
          title={isEdit ? translate('Edit credit') : translate('Create credit')}
          footer={
            <>
              <CloseDialogButton className="flex-equal min-w-125px" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
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
            <CustomRadioButton
              label={translate('Consumption logic')}
              name="minimal_consumption_logic"
              direction="horizontal"
              choices={[
                {
                  label: translate('Fixed'),
                  value: 'fixed',
                  description: translate(
                    'A minimal guaranteed credit reduction per month',
                  ),
                },
                {
                  label: translate('Linear'),
                  value: 'linear',
                  description: translate(
                    'A minimum amount deducted monthly, calculated based on the end date',
                  ),
                },
              ]}
            />
            {formValues.minimal_consumption_logic === 'fixed' ? (
              <NumberField
                label={translate('Minimal consumption (per month)')}
                name="minimal_consumption"
                placeholder={translate('Enter a value')}
              />
            ) : (
              <div className="mb-7">
                <Form.Label>
                  {translate('Minimal consumption (per month)')}
                </Form.Label>
                <FormControl
                  value={
                    needToRecalculateMinimalConsumption
                      ? translate(
                          'The value will be calculated after saving the credit',
                        )
                      : props.initialValues.minimal_consumption
                  }
                  readOnly
                />
              </div>
            )}
            <DateField
              name="end_date"
              label={translate('Credit end date')}
              required={formValues.minimal_consumption_logic === 'linear'}
              validate={
                formValues.minimal_consumption_logic === 'linear'
                  ? [required]
                  : undefined
              }
              minDate={
                formValues.minimal_consumption_logic === 'linear'
                  ? getStartOfNextMonth().toISO()
                  : undefined
              }
            />
            <Form.Group>
              <FieldError error={props.error} />
            </Form.Group>
          </FormContainer>
        </MetronicModalDialog>
      </form>
    );
  }),
);
