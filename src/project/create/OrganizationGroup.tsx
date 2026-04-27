import { Field } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { required } from '@/core/validators';
import { Select } from '@/form/AsyncSelectField';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

interface OrganizationGroupProps {
  onChange?(customer: Customer): void;
  isDisabled;
}

export const OrganizationGroup = ({
  onChange,
  isDisabled,
}: OrganizationGroupProps) => (
  <FormGroup label={translate('Organization')} required>
    <Field
      name="customer"
      validate={required}
      render={(fieldProps) => (
        <Select
          {...fieldProps}
          placeholder={translate('Select...')}
          loadOptions={(query, prevOptions, page) =>
            organizationAutocomplete(query, prevOptions, page, {
              field: [
                'uuid',
                'name',
                'url',
                'customer_unallocated_credit',
                'project_metadata_checklist',
              ],
              o: 'name',
            })
          }
          getOptionLabel={(option) => option.name}
          getOptionValue={(option) => option.url}
          noOptionsMessage={() => translate('No organizations')}
          isDisabled={isDisabled}
          onChange={(value) => {
            fieldProps.input.onChange(value);
            onChange(value);
          }}
        />
      )}
    />
  </FormGroup>
);
