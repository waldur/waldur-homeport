import { useMemo } from 'react';
import { Field } from 'react-final-form';
import { Customer } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelect as Select } from '@/form/select';
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
}: OrganizationGroupProps) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: [
          'uuid',
          'name',
          'url',
          'customer_unallocated_credit',
          'project_metadata_checklist',
          'default_affiliations',
        ],
        o: 'name',
      }),
    [],
  );

  return (
    <FormGroup label={translate('Organization')} required>
      <Field
        name="customer"
        validate={required}
        render={(fieldProps) => (
          <Select
            {...fieldProps.input}
            placeholder={translate('Select...')}
            loadOptions={loadOrganizations}
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
};
