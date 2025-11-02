import { Field } from 'redux-form';
import { OfferingComponent } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { InputField } from '@waldur/form/InputField';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

interface ComponentMultiplierConfigurationProps {
  name: string;
  offering?: {
    components?: OfferingComponent[];
  };
}

export const ComponentMultiplierConfiguration = ({
  name,
  offering,
}: ComponentMultiplierConfigurationProps) => {
  // Filter only limit-based components
  const limitComponents =
    offering?.components?.filter(
      (component) => component.billing_type === 'limit',
    ) || [];

  const componentOptions = limitComponents.map((component) => ({
    value: component.type,
    label: `${component.name} (${component.type})`,
  }));

  return (
    <>
      <FormGroup
        label={translate('Component Type')}
        description={translate(
          'Select the limit-based component this multiplier applies to',
        )}
        required
      >
        <Field
          name={`${name}.component_type`}
          validate={required}
          component={(fieldProps) => (
            <Select
              value={componentOptions.find(
                (opt) => opt.value === fieldProps.input.value,
              )}
              onChange={(option) => fieldProps.input.onChange(option?.value)}
              options={componentOptions}
              isClearable={false}
              placeholder={translate('Select component')}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
            />
          )}
        />
      </FormGroup>

      <FormGroup
        label={translate('Multiplication Factor')}
        description={translate(
          'User input will be multiplied by this factor to calculate the component limit',
        )}
        required
      >
        <Field
          name={`${name}.factor`}
          component={InputField}
          type="number"
          min="1"
          validate={required}
          placeholder={translate('e.g., 50000 for TB to inodes conversion')}
        />
      </FormGroup>

      <FormGroup
        label={translate('Minimum Limit')}
        description={translate(
          'Minimum allowed value for user input (optional)',
        )}
      >
        <Field
          name={`${name}.min_limit`}
          component={InputField}
          type="number"
          min="0"
          placeholder={translate('e.g., 1')}
        />
      </FormGroup>

      <FormGroup
        label={translate('Maximum Limit')}
        description={translate(
          'Maximum allowed value for user input (optional)',
        )}
      >
        <Field
          name={`${name}.max_limit`}
          component={InputField}
          type="number"
          min="0"
          placeholder={translate('e.g., 100')}
        />
      </FormGroup>
    </>
  );
};
