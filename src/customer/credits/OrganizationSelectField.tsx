import { FC, useMemo } from 'react';

import { required } from '@/core/validators';
import { AsyncSelectGroup } from '@/form';
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
    <AsyncSelectGroup
      name="customer"
      label={translate('Organization')}
      validate={required}
      required
      loadOptions={loadOrganizations}
      getOptionValue={(option) => option.url}
      getOptionLabel={(option) => option.name}
      noOptionsMessage={() => translate('No organizations')}
      isDisabled={isDisabled}
    />
  );
};
