import * as React from 'react';
import Select from 'react-select';
import { Field, formValues } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface Values {
  billingType: {
    value: 'usage' | 'fixed'
  };
}

interface Props {
  component: string;
  removeOfferingQuotas(): void;
}

const enhance = formValues(props => ({
  billingType: `${props.component}.billing_type`,
}));

export const ComponentForm = enhance((props: Values & Props) => (
  <>
    <FormGroup label={translate('Internal name')} required={true}>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.type`}
        type="text"
        validate={required}
      />
    </FormGroup>
    <FormGroup label={translate('Display name')} required={true}>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.name`}
        type="text"
        validate={required}
      />
    </FormGroup>
    <FormGroup label={translate('Measured unit')}>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.measured_unit`}
        type="text"
      />
    </FormGroup>
    <FormGroup label={translate('Accounting type')} required={true}>
      <Field
        name={`${props.component}.billing_type`}
        validate={required}
        onChange={(_, newOption, prevOption) => {
          if (newOption && prevOption && newOption.value === 'usage' && prevOption.value === 'fixed') {
            props.removeOfferingQuotas();
          }
        }}
        component={fieldProps => (
          <Select
            value={fieldProps.input.value}
            onChange={value => fieldProps.input.onChange(value)}
            options={[
              {label: translate('Usage-based'), value: 'usage'},
              {label: translate('Fixed price'), value: 'fixed'},
            ]}
            clearable={false}
          />
        )}
      />
    </FormGroup>
    {props.billingType && props.billingType.value === 'usage' && (
      <>
        <FormGroup label={translate('Limit period')}>
          <Field
            name={`${props.component}.limit_period`}
            normalize={choice => choice.value}
            component={fieldProps => (
              <Select
                value={fieldProps.input.value}
                onChange={value => fieldProps.input.onChange(value)}
                options={[
                  {label: translate(`Maximum monthly - every month service provider can report up to the amount requested by user.`), value: 'month'},
                  {label: translate(`Maximum total - SP can report up to the requested amount over the whole active state of resource.`), value: 'total'},
                ]}
                clearable={false}
              />
            )}
          />
        </FormGroup>
        <FormGroup label={translate('Limit amount')}>
          <Field
            component="input"
            className="form-control"
            name={`${props.component}.limit_amount`}
            type="number"
            min={0}
          />
        </FormGroup>
      </>
    )}
  </>
)) as React.ComponentType<Props>;
