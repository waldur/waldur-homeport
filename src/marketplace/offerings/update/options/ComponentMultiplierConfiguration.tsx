import { PublicOfferingDetails } from 'waldur-js-client';

import { required } from '@/core/validators';
import { NumberGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';

import { ValidatorConfiguration } from './ValidatorConfiguration';

interface ComponentMultiplierConfigurationProps {
  offering?: PublicOfferingDetails;
}

export const ComponentMultiplierConfiguration = ({
  offering,
}: ComponentMultiplierConfigurationProps) => {
  const name = 'component_multiplier_config';
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
      <SelectGroup
        name={`${name}.component_type`}
        label={translate('Component Type')}
        description={translate(
          'Select the limit-based component this multiplier applies to',
        )}
        required
        validate={required}
        options={componentOptions}
        isClearable={false}
        placeholder={translate('Select component')}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        simpleValue
      />
      <NumberGroup
        name={`${name}.factor`}
        validate={required}
        label={translate('Multiplication Factor')}
        description={translate(
          'User input will be multiplied by this factor to calculate the component limit',
        )}
        required
        type="number"
        min="1"
        placeholder={translate('e.g., 50000 for TB to inodes conversion')}
      />
      <NumberGroup
        label={translate('Minimum Limit')}
        description={translate(
          'Minimum allowed value for user input (optional)',
        )}
        name={`${name}.min_limit`}
        type="number"
        min="0"
        placeholder={translate('e.g., 1')}
      />
      <NumberGroup
        label={translate('Maximum Limit')}
        description={translate(
          'Maximum allowed value for user input (optional)',
        )}
        name={`${name}.max_limit`}
        type="number"
        min="0"
        placeholder={translate('e.g., 100')}
      />
      <ValidatorConfiguration offering={offering} />
    </>
  );
};
