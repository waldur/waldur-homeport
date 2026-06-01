import { useMemo } from 'react';
import { Customer } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';

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
    <AsyncSelectGroup
      name="customer"
      label={translate('Organization')}
      required
      validate={required}
      placeholder={translate('Select...')}
      loadOptions={loadOrganizations}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.url}
      noOptionsMessage={() => translate('No organizations')}
      isDisabled={isDisabled}
      onChange={onChange}
    />
  );
};
