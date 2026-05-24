import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form/FormGroup';
import { AsyncSelect as Select } from '@/form/select';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

interface OrganizationSelectFieldProps {
  isDisabled?: boolean;
}

export const OrganizationSelectField: FC<OrganizationSelectFieldProps> = ({
  isDisabled,
}) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'url'],
      }),
    [],
  );

  return (
    <Field
      name="customer"
      label={translate('Organization')}
      validate={required}
      required
      component={FormGroup}
    >
      <Select
        loadOptions={loadOrganizations}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.name}
        noOptionsMessage={() => translate('No organizations')}
        isDisabled={isDisabled}
      />
    </Field>
  );
};
