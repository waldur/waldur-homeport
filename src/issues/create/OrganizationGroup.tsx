import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { AsyncSelect as Select } from '@/form/select';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

export const OrganizationGroup = ({ disabled }) => {
  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'url'],
        o: 'name',
      }),
    [],
  );

  return (
    <Field
      name="customer"
      component={FormGroup}
      label={translate('Organization')}
      validate={!disabled ? required : undefined}
      containerClassName="flex-equal"
    >
      <Select
        defaultOptions
        loadOptions={loadOrganizations}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.uuid}
        isDisabled={disabled}
      />
    </Field>
  );
};
