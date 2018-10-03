import * as React from 'react';
import Select from 'react-select';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

interface ComponentFormProps {
  component: string;
}

export const ComponentForm = (props: ComponentFormProps) => (
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
    <FormGroup label={translate('Measured unit')} required={true}>
      <Field
        component="input"
        className="form-control"
        name={`${props.component}.measured_unit`}
        type="text"
        validate={required}
      />
    </FormGroup>
    <FormGroup label={translate('Accounting type')} required={true}>
      <Field
        name={`${props.component}.billing_type`}
        validate={required}
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
  </>
);
