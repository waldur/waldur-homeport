import { useMemo } from 'react';

import { requiredUnless } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

/** A standalone issue has no organization, so the field is not required then. */
const validateCustomer = requiredUnless((values) => values.standaloneIssue);

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
    <AsyncSelectGroup
      name="customer"
      label={translate('Organization')}
      validate={validateCustomer}
      containerClassName="flex-equal"
      defaultOptions
      loadOptions={loadOrganizations}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.uuid}
      isDisabled={disabled}
    />
  );
};
