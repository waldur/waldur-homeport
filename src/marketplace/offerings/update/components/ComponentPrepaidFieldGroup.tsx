import { Field, formValues } from 'redux-form';
import {
  BillingTypeEnum,
  OfferingComponent,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { NumberField, SelectField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

const enhance = formValues<any, { readOnly?: boolean }>(() => ({
  billingType: 'billing_type',
  isPrepaid: 'is_prepaid',
}));

export const ComponentPrepaidFieldGroup = enhance(
  (props: {
    offering: ProviderOfferingDetails;
    billingType: { value: BillingTypeEnum };
    isPrepaid: boolean;
  }) =>
    props.billingType?.value == 'one' ? (
      <>
        <FormGroup>
          <Field
            name="is_prepaid"
            validate={required}
            component={AwesomeCheckboxField}
            label={translate('Pre-paid component')}
          />
        </FormGroup>
        {props.isPrepaid ? (
          <>
            <FormGroup label={translate('Minimal prepaid duration')}>
              <Field name="min_prepaid_duration" component={NumberField} />
            </FormGroup>
            <FormGroup label={translate('Maximal prepaid duration')}>
              <Field name="max_prepaid_duration" component={NumberField} />
            </FormGroup>
            <FormGroup label={translate('Overage component')}>
              <Field
                name="overage_component"
                component={SelectField}
                options={props.offering.components.filter(
                  (component) => component.billing_type == 'usage',
                )}
                getOptionValue={(option: OfferingComponent) => option.uuid}
                getOptionLabel={(option: OfferingComponent) => option.name}
                simpleValue
              />
            </FormGroup>
          </>
        ) : null}
      </>
    ) : null,
);
